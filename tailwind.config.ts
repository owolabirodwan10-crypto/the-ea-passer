import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08090C",
        surface: "#10131A",
        surface2: "#161A22",
        border: "#232833",
        borderSoft: "#1B1F28",
        primary: "#2F7CF6",
        primaryBright: "#57C7F5",
        chrome: "#C9CFDA",
        text: "#F2F4F7",
        muted: "#868FA1",
        mutedSoft: "#5D6577",
        success: "#34D399",
        warning: "#F5B942",
        error: "#F0576B",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
