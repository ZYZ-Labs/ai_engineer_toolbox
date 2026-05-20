import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "../../content/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f8f9fb",
        panel: "#ffffff",
        line: "#ececec",
        ink: "#182033",
        muted: "#667085",
        primary: "#4F46E5",
        "primary-soft": "#eef2ff",
        success: "#087f5b",
        warning: "#b7791f"
      },
      fontFamily: {
        sans: [
          "Inter",
          "MiSans",
          "HarmonyOS Sans",
          "Noto Sans SC",
          "ui-sans-serif",
          "system-ui"
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      },
      boxShadow: {
        soft: "0 18px 48px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        spec: "16px"
      }
    }
  },
  plugins: []
};

export default config;
