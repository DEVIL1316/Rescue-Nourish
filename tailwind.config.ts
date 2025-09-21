import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-danger': 'var(--gradient-danger)',
        'gradient-toxic': 'var(--gradient-toxic)',
        'gradient-dark': 'var(--gradient-dark)',
        'gradient-blood': 'var(--gradient-blood)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'danger': 'var(--shadow-danger)',
        'toxic': 'var(--shadow-toxic)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-danger": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        "shake": {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-2px)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(2px)",
          },
        },
        "zombie-walk": {
          "0%": {
            transform: "translateY(0) rotateZ(-2deg)",
          },
          "50%": {
            transform: "translateY(-2px) rotateZ(2deg)",
          },
          "100%": {
            transform: "translateY(0) rotateZ(-2deg)",
          },
        },
        "muzzle-flash": {
          "0%": {
            opacity: "0",
            transform: "scale(0.5)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.2)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-danger": "pulse-danger 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shake": "shake 0.5s ease-in-out",
        "zombie-walk": "zombie-walk 1s ease-in-out infinite",
        "muzzle-flash": "muzzle-flash 0.1s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
