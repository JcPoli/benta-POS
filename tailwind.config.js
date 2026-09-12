/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cool-mist canvas, elevated white surfaces, graphite ink.
        mist: "#f1f3f7",
        surface: { DEFAULT: "#ffffff", alt: "#f8fafc" },
        graphite: "#15161b",
        ink: "#15161b",
        muted: { DEFAULT: "#667085", soft: "#98a2b3" },
        line: { DEFAULT: "#e6e8ee", strong: "#d3d8e0" },
        // The one accent, reserved for money actions. `soft` and `ring` are the
        // tinted surface and hairline an accented state sits on, named here so
        // they stay one value rather than drifting per component.
        em: {
          DEFAULT: "#00a870",
          dark: "#008c5d",
          soft: "rgba(0, 168, 112, 0.1)",
          ring: "rgba(0, 168, 112, 0.38)",
        },
        danger: {
          DEFAULT: "#d92d20",
          soft: "rgba(217, 45, 32, 0.07)",
          ring: "rgba(217, 45, 32, 0.34)",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.05)",
        lift: "0 1px 3px rgba(16, 24, 40, 0.06), 0 14px 34px -14px rgba(16, 24, 40, 0.16)",
        sheet: "0 2px 6px rgba(16, 24, 40, 0.07), 0 24px 60px -20px rgba(16, 24, 40, 0.26)",
        pay: "0 8px 20px -10px rgba(0, 168, 112, 0.8)",
        // The inner hairline that marks a chosen option.
        select: "inset 0 0 0 1px #15161b",
      },
      keyframes: {
        "sheet-in": {
          from: { transform: "translateX(18px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(18px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        // Motion only answers an action; nothing animates on load.
        "sheet-in": "sheet-in 0.22s cubic-bezier(0.2, 0.7, 0.2, 1)",
        "sheet-up": "sheet-up 0.22s cubic-bezier(0.2, 0.7, 0.2, 1)",
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};
