import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        mainBg: 'var(--bg-main)',
        headerBg: 'var(--bg-header)',
        buttonBg: 'var(--bg-button)',
        inputBg: 'var(--bg-input)',
        buttonHoverBg: 'var(--bg-button-hover)',
        mainFont: 'var(--font-primary)',
        buttonFont: 'var(--font-button)',
        hoverFont: 'var(--font-button-hover)',
        subButtonFont: 'var(--font-button-sub)',
        primaryBorder: 'var(--border-primary)',
        secondaryBorder: 'var(--border-secondary)',
        tertiaryBorder: 'var(--border-tertiary)',
        box: {
          border: '#1C1C1E',
          bg: '#0E0E10',
          fontSub: '#525252',
          placeholder: '#808080',
        }
      },
      boxShadow: {
        'signin': '0px 22px 28.4px 0px #00000040',
        'input': '0px 0px 7.3px 0px #00000087 inset',
        'btn-signin': '0px 19px 21.5px 0px #0000006B',
        'btn-google': '0px 4px 6.7px -1px #00000040',
        'input-box': '0px 10px 18px -7px #00000040'
      },
      backdropBlur: {
        'btn-signin': '9.6px'
      },
      backgroundImage: {
        'btn-signin': 'linear-gradient(180deg, #FFFFFF 0%, #999999 100%)',
        'input-box': 'linear-gradient(180deg, #DFDFDF 0%, #BFBFBF 100%)',
        'btn-shadow': 'linear-gradient(180deg, #454449 0%, rgba(69, 68, 73, 0) 100%), linear-gradient(0deg, #2C2B30, #2C2B30)',
        'btn-new-chat': 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))',
        'radial-white': 'radial-gradient(circle at top left, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)'
      },
      keyframes: {
        "zoom-in": {
          '0%': { transform: 'translate(-50%, -50%) scale(0.8)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)' }
        },
        "zoom-out": {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { transform: 'translate(-50%, -50%) scale(0.8)' }
        }
      }
    }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
