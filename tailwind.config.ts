import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom AuthEmpire palette
        empire: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        secure: {
          green: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.8) 100%)",
        "glow-gradient": "radial-gradient(ellipse at center, rgba(14,165,233,0.15) 0%, rgba(255,255,255,0) 70%)",
        "hero-gradient": "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f8fafc 50%, #eff6ff 75%, #f0fdf4 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)",
        "secure-gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "warn-gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "danger-gradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        "otp-gradient": "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        "glass-lg": "0 20px 60px rgba(14,165,233,0.15), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        "glass-sm": "0 4px 16px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        glow: "0 0 20px rgba(14,165,233,0.4), 0 0 40px rgba(14,165,233,0.2)",
        "glow-green": "0 0 20px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.2)",
        "glow-red": "0 0 20px rgba(239,68,68,0.4), 0 0 40px rgba(239,68,68,0.2)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)",
        "inner-glow": "inset 0 0 30px rgba(14,165,233,0.1)",
        card: "0 4px 20px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(14,165,233,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(14,165,233,0.6), 0 0 60px rgba(14,165,233,0.3)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        siren: {
          "0%, 100%": { backgroundColor: "rgba(239,68,68,0.1)" },
          "50%": { backgroundColor: "rgba(239,68,68,0.25)" },
        },
        "number-roll": {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "count-down": {
          from: { strokeDashoffset: "0" },
          to: { strokeDashoffset: "283" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        glow: "glow 2s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scan-line": "scan-line 3s linear infinite",
        siren: "siren 0.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
