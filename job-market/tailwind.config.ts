import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        muted: "var(--text-muted)",
        secondary: "var(--text-secondary)",
        charcoal: "#1A1714",
        cream: "#F7F5F0",
        sage: "#4A7A5A",
        rose: "#B85040",
        lavender: "#9B8BB8",
        "soft-blue": "#5B8DBF",
        orange: "#C8714A",
        "below-baseline": "var(--below-baseline)",
        "above-baseline": "var(--above-baseline)",
        "ai-acceleration": "var(--ai-acceleration)",
        openai: "var(--openai)",
        anthropic: "var(--anthropic)",
        "pale-lavender": "var(--pale-lavender)",
        "accent-ai": "var(--accent-ai)",
        knowledge: {
          DEFAULT: "#5C4D7A",
          bg: "#F3F0F8",
          border: "#D8D0E8",
          accent: "#7B6BA8",
        },
        care: {
          DEFAULT: "#3D6B5C",
          bg: "#EFF5F2",
          border: "#C5DDD4",
          accent: "#5A8F7A",
        },
        tech: {
          DEFAULT: "#8A6B3D",
          bg: "#F8F4ED",
          border: "#E5D9C4",
          accent: "#B8925A",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(26, 23, 20, 0.05)",
        "card-hover": "0 4px 20px rgba(26, 23, 20, 0.08)",
      },
      spacing: {
        nav: "var(--nav-height)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        reveal: "650ms",
      },
      transitionTimingFunction: {
        reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 750ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 600ms ease-out both",
      },
      animationDelay: {
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
