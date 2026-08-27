/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/src/**/*.{html,ts,tsx,js,jsx}',
    './libs/**/src/**/*.{html,ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors mapped from themes.scss
        theme: {
          primary: 'var(--theme-primary-color)',
          accent: 'var(--theme-accent-color)',
          background: 'var(--theme-background-color)',
          surface: 'var(--theme-surface-color)',
          text: 'var(--theme-text-color)',
          'text-secondary': 'var(--theme-text-secondary)',
          border: 'var(--theme-border-color)',
          hover: 'var(--theme-hover-color)',
        },
        // Default theme colors
        default: {
          primary: '#455a64',
          accent: '#FFC727',
          background: '#ffffff',
          text: '#263238',
          'text-secondary': '#757575',
          border: '#e0e0e0',
        },
        // Umdzidzisi brand colors - Corporate Purple Palette
        umdzidzisi: {
          // Corporate light theme
          primary: '#544a88',
          accent: '#756d9e',
          background: '#ffffff',
          surface: '#fafafa',
          text: '#0b0a14',
          'text-secondary': '#544a88',
          border: '#d7d6e0',
          hover: '#3a3166',
          // Complete color scale (50-900)
          50: '#faf9fb',
          100: '#d7d6e0',
          200: '#b8b5ca',
          300: '#9891b4',
          400: '#756d9e',
          500: '#544a88',
          600: '#3a3166',
          700: '#282148',
          800: '#19162c',
          900: '#0b0a14',
        },
        // Insurance brand colors - Trust Blue Palette
        insurance: {
          // Trust blue light theme
          primary: '#1e3a5f',
          accent: '#00a19a',
          background: '#ffffff',
          surface: '#f8fafb',
          text: '#0d1b2a',
          'text-secondary': '#3c5a7d',
          border: '#d5dee7',
          hover: '#152b46',
          // Complete color scale (50-900)
          50: '#f8fafb',
          100: '#e4ebf2',
          200: '#d5dee7',
          300: '#a8c4e0',
          400: '#7fa8d4',
          500: '#3c5a7d',
          600: '#1e3a5f',
          700: '#152b46',
          800: '#132235',
          900: '#0d1b2a',
        },
        // Umtengesi brand colors
        umtengesi: {
          primary: '#FF725E',
          accent: '#d78776',
          background: '#fafafa',
          text: '#212121',
          'text-secondary': '#757575',
          border: '#e0e0e0',
        },
        // App selector gradient colors
        gradient: {
          purple: '#667eea',
          'purple-dark': '#764ba2',
        },
        // Gray scale from app-selector.component.scss
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        // Material Design notification colors
        success: {
          DEFAULT: '#52c41a',
          light: '#f6ffed',
        },
        error: {
          DEFAULT: '#ff4d4f',
          light: '#fff2f0',
        },
        warning: {
          DEFAULT: '#faad14',
          light: '#fffbe6',
        },
        info: {
          DEFAULT: '#1890ff',
          light: '#e6f7ff',
        },
      },
      boxShadow: {
        theme: '0 0 0 1px var(--theme-shadow)',
        notification: '0 2px 8px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 12px 24px rgba(102, 126, 234, 0.15)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        spin: 'spin 0.8s linear infinite',
        'dropdown-fade-in': 'dropdownFadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          from: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        spin: {
          to: {
            transform: 'rotate(360deg)',
          },
        },
        dropdownFadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(-8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
