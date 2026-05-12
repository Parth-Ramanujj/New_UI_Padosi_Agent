
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				sans: ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				orange: {
					50: 'hsl(33 100% 96%)',
					100: 'hsl(33 100% 92%)',
					200: 'hsl(33 100% 84%)',
					300: 'hsl(33 100% 76%)',
					400: 'hsl(27 96% 61%)',
					500: 'hsl(25 95% 53%)',
					600: 'hsl(21 90% 48%)',
					700: 'hsl(17 88% 40%)',
					800: 'hsl(15 79% 34%)',
					900: 'hsl(15 75% 28%)',
					950: 'hsl(13 81% 15%)',
				},
				purple: {
					50: 'hsl(270 100% 98%)',
					100: 'hsl(269 100% 95%)',
					200: 'hsl(269 100% 92%)',
					300: 'hsl(269 97% 85%)',
					400: 'hsl(270 95% 75%)',
					500: 'hsl(271 91% 65%)',
					600: 'hsl(272 81% 56%)',
					700: 'hsl(272 72% 47%)',
					800: 'hsl(273 67% 39%)',
					900: 'hsl(274 66% 32%)',
					950: 'hsl(274 87% 21%)',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					lighter: 'hsl(var(--primary-lighter))',
					dark: 'hsl(var(--primary-dark))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					light: 'hsl(var(--secondary-light))',
					lighter: 'hsl(var(--secondary-lighter))',
					dark: 'hsl(var(--secondary-dark))',
					glow: 'hsl(var(--secondary-glow))'
				},
				'logo-blue': {
					DEFAULT: 'hsl(var(--logo-blue))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					light: 'hsl(var(--accent-light))',
					lighter: 'hsl(var(--accent-lighter))',
					dark: 'hsl(var(--accent-dark))',
					glow: 'hsl(var(--accent-glow))'
				},
				claim: {
					DEFAULT: 'hsl(var(--claim))',
					foreground: 'hsl(var(--claim-foreground))',
					light: 'hsl(var(--claim-light))',
					lighter: 'hsl(var(--claim-lighter))',
					dark: 'hsl(var(--claim-dark))'
				},
				review: {
					DEFAULT: 'hsl(var(--review))',
					foreground: 'hsl(var(--review-foreground))',
					light: 'hsl(var(--review-light))',
					lighter: 'hsl(var(--review-lighter))',
					dark: 'hsl(var(--review-dark))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					lighter: 'hsl(var(--success-lighter))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				'sm': '0 1px 3px 0 rgb(0 0 0 / 0.06)',
				'DEFAULT': '0 2px 6px 0 rgb(0 0 0 / 0.08)',
				'md': '0 4px 12px -2px rgb(0 0 0 / 0.08)',
				'lg': '0 8px 24px -4px rgb(0 0 0 / 0.1)',
				'xl': '0 12px 32px -6px rgb(0 0 0 / 0.12)',
				'2xl': '0 16px 48px -8px rgb(0 0 0 / 0.14)',
				'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.625rem',
				sm: '0.5rem',
				xl: '1rem',
				'2xl': '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'float-gentle': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'25%': { transform: 'translateY(-4px) rotate(0.5deg)' },
					'50%': { transform: 'translateY(-6px) rotate(0deg)' },
					'75%': { transform: 'translateY(-4px) rotate(-0.5deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)', boxShadow: '0 0 0 0 hsl(var(--primary) / 0.2)' },
					'50%': { opacity: '0.95', transform: 'scale(1.01)', boxShadow: '0 0 16px 4px hsl(var(--primary) / 0.15)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-in-smooth': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'60%': { opacity: '1', transform: 'scale(1.02)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 12px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 24px hsl(var(--primary) / 0.4)' }
				},
				'glow-pulse': {
					'0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.03)' }
				},
				'glow-rotate': {
					'0%': { transform: 'rotate(0deg) scale(1.15)' },
					'100%': { transform: 'rotate(360deg) scale(1.15)' }
				},
				'icon-breathe': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.9' }
				},
				'icon-pop-smooth': {
					'0%': { transform: 'scale(0.5)', opacity: '0' },
					'50%': { transform: 'scale(1.08)', opacity: '0.8' },
					'75%': { transform: 'scale(0.98)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'wiggle-smooth': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'20%': { transform: 'rotate(-3deg)' },
					'40%': { transform: 'rotate(3deg)' },
					'60%': { transform: 'rotate(-2deg)' },
					'80%': { transform: 'rotate(2deg)' }
				},
				'bounce-in-smooth': {
					'0%': { transform: 'scale(0.4) translateY(10px)', opacity: '0' },
					'50%': { transform: 'scale(1.03) translateY(-2px)', opacity: '0.9' },
					'70%': { transform: 'scale(0.98) translateY(1px)', opacity: '1' },
					'100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
				},
				'lift-hover': {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'50%': { transform: 'translateY(-3px) scale(1.02)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				'accordion-up': 'accordion-up 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				'float': 'float 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'float-gentle': 'float-gentle 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
				'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
				'fade-in': 'fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
				'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
				'scale-in-smooth': 'scale-in-smooth 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
				'bounce-slow': 'bounce 3s infinite',
				'spin-slow': 'spin 8s linear infinite',
				'shimmer': 'shimmer 2.5s linear infinite',
				'glow': 'glow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'glow-rotate': 'glow-rotate 5s linear infinite',
				'icon-breathe': 'icon-breathe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'icon-pop-smooth': 'icon-pop-smooth 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
				'wiggle-smooth': 'wiggle-smooth 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-in-smooth': 'bounce-in-smooth 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
				'lift-hover': 'lift-hover 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
