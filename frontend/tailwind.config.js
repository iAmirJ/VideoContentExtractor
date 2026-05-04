/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // English Comment: Custom color palette for a high-end, modern dark UI
      colors: {
        glass: "rgba(255, 255, 255, 0.05)",
        darkBase: "#0f172a", // Deep blue-black background
        accent: "#6366f1",   // Indigo accent for buttons
        chatUser: "#3b82f6", // Vivid Blue for user bubbles
        chatBot: "#1e293b",  // Dark Slate for bot bubbles
      },
      // English Comment: Custom animations for smooth entry and interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}