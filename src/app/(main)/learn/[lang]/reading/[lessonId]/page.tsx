"use client";

import Link from "next/link";
import { useLessons } from "@/hooks/useLessons";
import { apiPost } from "@/lib/api";
import { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function ReadingDetail({ params }: { params: { lang: string; lessonId: string } }) {
  const { data } = useLessons(params.lang, "reading");
  const lesson = (data?.lessons ?? []).find((x: any) => x.id === params.lessonId);
  const [score, setScore] = useState(0);

  async function save() {
    await apiPost("/api/progress", { lessonId: params.lessonId, score });
    alert("Saved");
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-3">
        <Link className="underline" href={`/learn/${params.lang}/reading`}>← Back</Link>
        <div>Lesson not found.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <Link className="underline" href={`/learn/${params.lang}/reading`}>← Back</Link>
      <h1 className="text-xl font-semibold">{lesson.title}</h1>
      <div className="text-sm text-gray-600">{lesson.level}</div>

      <pre className="rounded border p-3 overflow-auto text-sm">{JSON.stringify(lesson.content, null, 2)}</pre>

      <div className="flex gap-2 items-center">
        <Input className="w-28" type="number" value={score} onChange={(e)=>setScore(Number(e.target.value))} />
        <Button onClick={save}>Save progress</Button>
      </div>
    </div>
  );
}
