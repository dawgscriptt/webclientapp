import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function nowIso() {
  return new Date().toISOString();
}

async function ensureAuthForAccount(params: { accountId: string; email: string; password: string }) {
  const email = params.email.toLowerCase().trim();

  const byEmail = await prisma.userAuth.findUnique({ where: { email } });
  if (byEmail) return;

  const byAccount = await prisma.userAuth.findUnique({ where: { accountId: params.accountId } });
  if (byAccount) return;

  const passwordHash = await bcrypt.hash(params.password, 10);
  await prisma.userAuth.create({
    data: {
      accountId: params.accountId,
      email,
      passwordHash,
    },
  });
}

async function main() {
  // 0) Admin + Demo user (login için)
  const adminEmail = "admin@local.dev";
  const adminPass = "admin123";

  const demoEmail = "demo@local.dev";
  const demoPass = "demo123";

  const admin = await prisma.account.upsert({
    where: { username: "admin" },
    update: {
      displayName: "Admin",
      verified: true,
      accountType: "user",
      dmPolicy: "everyone",
      role: "admin",
    },
    create: {
      username: "admin",
      displayName: "Admin",
      verified: true,
      accountType: "user",
      dmPolicy: "everyone",
      role: "admin",
      bio: "Platform admin account.",
    },
    select: { id: true },
  });

  await ensureAuthForAccount({ accountId: admin.id, email: adminEmail, password: adminPass });

  const demo = await prisma.account.upsert({
    where: { username: "demo" },
    update: {
      displayName: "Demo User",
      verified: false,
      accountType: "user",
      dmPolicy: "everyone",
      role: "user",
    },
    create: {
      username: "demo",
      displayName: "Demo User",
      verified: false,
      accountType: "user",
      dmPolicy: "everyone",
      role: "user",
      bio: "Demo account for testing.",
    },
    select: { id: true },
  });

  await ensureAuthForAccount({ accountId: demo.id, email: demoEmail, password: demoPass });

  // 1) Hubs
  const hubs = [
    { langCode: "en", name: "English", description: "English learning hub" },
    { langCode: "de", name: "Deutsch", description: "German learning hub" },
    { langCode: "fr", name: "Français", description: "French learning hub" },
    { langCode: "es", name: "Español", description: "Spanish learning hub" },
    { langCode: "it", name: "Italiano", description: "Italian learning hub" },
    { langCode: "tr", name: "Türkçe", description: "Turkish learning hub" },
  ];

  for (const h of hubs) {
    await prisma.hub.upsert({
      where: { langCode: h.langCode },
      update: { name: h.name, description: h.description },
      create: h,
    });
  }

  // Admin subscribe: en + tr (idempotent)
  const [enHub, trHub] = await Promise.all([
    prisma.hub.findUnique({ where: { langCode: "en" }, select: { id: true } }),
    prisma.hub.findUnique({ where: { langCode: "tr" }, select: { id: true } }),
  ]);

  for (const h of [enHub, trHub].filter(Boolean) as Array<{ id: string }>) {
    await prisma.hubSubscription.upsert({
      where: { accountId_hubId: { accountId: admin.id, hubId: h.id } },
      update: {},
      create: { accountId: admin.id, hubId: h.id },
    });
  }

  // 2) Verified bots
  const bots = [
    {
      username: "dailylessonbot",
      displayName: "Daily Lesson Bot",
      systemPrompt:
        "You create short, accurate, CEFR-aligned daily mini lessons for language learners. Output must be JSON only.",
    },
    {
      username: "quizbot",
      displayName: "Quiz Bot",
      systemPrompt: "You create short quizzes for language learners. Output must be JSON only.",
    },
    {
      username: "readingbot",
      displayName: "Reading Bot",
      systemPrompt: "You create short reading passages with comprehension questions. Output must be JSON only.",
    },
    {
      username: "listeningbot",
      displayName: "Listening Bot",
      systemPrompt: "You create short listening scripts with comprehension questions. Output must be JSON only.",
    },
    {
      username: "grammarfixer",
      displayName: "Grammar Fixer Bot",
      systemPrompt: "You correct user text, explain mistakes briefly, and give improved alternatives.",
    },
  ] as const;

  const botAccounts: Record<string, string> = {};

  for (const b of bots) {
    const account = await prisma.account.upsert({
      where: { username: b.username },
      update: {
        displayName: b.displayName,
        accountType: "bot",
        role: "user",
        verified: true,
        dmPolicy: "everyone",
      },
      create: {
        username: b.username,
        displayName: b.displayName,
        accountType: "bot",
        role: "user",
        verified: true,
        dmPolicy: "everyone",
        bio: "Bot account",
      },
      select: { id: true, username: true },
    });

    botAccounts[account.username] = account.id;

    await prisma.botConfig.upsert({
      where: { accountId: account.id },
      update: {
        systemPrompt: b.systemPrompt,
        allowedActions: { canPost: true, canComment: true, canDM: true },
        modelPolicy: {
          provider: "openai-compatible",
          model: process.env.LLM_MODEL ?? "gpt-4.1-mini",
          temperature: 0.6,
          maxTokens: 900,
        },
      },
      create: {
        accountId: account.id,
        systemPrompt: b.systemPrompt,
        allowedActions: { canPost: true, canComment: true, canDM: true },
        modelPolicy: {
          provider: "openai-compatible",
          model: process.env.LLM_MODEL ?? "gpt-4.1-mini",
          temperature: 0.6,
          maxTokens: 900,
        },
      },
    });
  }

  // 3) Seed sample Lessons (reading + listening) for EN (idempotent)
  const en = await prisma.hub.findUnique({ where: { langCode: "en" }, select: { id: true } });
  if (en) {
    const readingBotId = botAccounts["readingbot"];
    const listeningBotId = botAccounts["listeningbot"];

    const readingSamples = [
      {
        level: "A2",
        title: "A Short Email to a Friend",
        content: {
          lang: "en",
          level: "A2",
          passage:
            "Hi Alex,\n\nHow are you? I’m in Istanbul this week. The city is beautiful and the food is amazing. Yesterday I visited a museum and walked near the sea.\n\nSee you soon!\nMina",
          questions: [
            { q: "Where is Mina?", a: "In Istanbul" },
            { q: "What did Mina do yesterday?", a: "Visited a museum and walked near the sea" },
          ],
        },
      },
      {
        level: "B1",
        title: "Choosing a New Hobby",
        content: {
          lang: "en",
          level: "B1",
          passage:
            "Many people want a hobby to relax after work. Some choose sports, while others prefer music or cooking. The best hobby is one you can enjoy regularly and improve over time.",
          questions: [
            { q: "Why do people want a hobby?", a: "To relax after work" },
            { q: "What makes a hobby ‘best’?", a: "You can enjoy it regularly and improve over time" },
          ],
        },
      },
    ];

    for (const s of readingSamples) {
      const exists = await prisma.lesson.findFirst({
        where: { hubId: en.id, type: "reading", level: s.level, title: s.title },
        select: { id: true },
      });
      if (exists) continue;

      await prisma.lesson.create({
        data: {
          hubId: en.id,
          type: "reading",
          level: s.level,
          title: s.title,
          content: s.content,
          createdById: readingBotId,
          publishedAt: new Date(),
        },
      });
    }

    const listeningSamples = [
      {
        level: "A2",
        title: "At the Coffee Shop",
        content: {
          lang: "en",
          level: "A2",
          script:
            "Barista: Hello! What would you like?\nCustomer: I'd like a cappuccino, please.\nBarista: Sure. Anything else?\nCustomer: No, thank you.",
          questions: [
            { q: "What does the customer order?", options: ["Tea", "Cappuccino", "Water", "Juice"], answer: 1 },
            { q: "Does the customer want anything else?", options: ["Yes", "No", "Not sure", "Later"], answer: 1 },
          ],
        },
      },
    ];

    for (const s of listeningSamples) {
      const exists = await prisma.lesson.findFirst({
        where: { hubId: en.id, type: "listening", level: s.level, title: s.title },
        select: { id: true },
      });
      if (exists) continue;

      await prisma.lesson.create({
        data: {
          hubId: en.id,
          type: "listening",
          level: s.level,
          title: s.title,
          content: s.content,
          createdById: listeningBotId,
          publishedAt: new Date(),
        },
      });
    }
  }

  // 4) Seed sample Post (global feed boş kalmasın) (idempotent)
  const firstHub = await prisma.hub.findFirst({
    orderBy: { langCode: "asc" },
    select: { id: true, langCode: true },
  });
  const dailyBotId = botAccounts["dailylessonbot"];

  if (firstHub && dailyBotId) {
    const title = `Welcome! Daily mini-lessons start now (${firstHub.langCode})`;

    const exists = await prisma.post.findFirst({
      where: { hubId: firstHub.id, authorId: dailyBotId, title },
      select: { id: true },
    });

    if (!exists) {
      await prisma.post.create({
        data: {
          hubId: firstHub.id,
          authorId: dailyBotId,
          type: "lesson",
          title,
          content: {
            createdAt: nowIso(),
            note: "Run cron /api/cron/daily-lesson to auto-generate lessons.",
          },
        },
      });
    }
  }

  console.log("✅ Seed complete");
  console.log("Admin login: admin@local.dev / admin123");
  console.log("Demo login:  demo@local.dev / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
