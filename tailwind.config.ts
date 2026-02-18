import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.08)",
        softDark: "0 10px 30px rgba(0,0,0,.35)",
      },
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        card: "hsl(var(--card))",
        cardFg: "hsl(var(--card-fg))",
        muted: "hsl(var(--muted))",
        mutedFg: "hsl(var(--muted-fg))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        brand: "hsl(var(--brand))",
        brandFg: "hsl(var(--brand-fg))",
        danger: "hsl(var(--danger))",
        dangerFg: "hsl(var(--danger-fg))",
      },
    },
  },
  plugins: [],
} satisfies Config;
