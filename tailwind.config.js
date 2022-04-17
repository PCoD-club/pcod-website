const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#B300FF",
        red: "#F52F57",
        yellow: "#F7C22C",
        green: "#5AB46C",
        blue: "#5983B5",
        purple: "#BA2FF5",
      },
      fontFamily: {
        sans: ["Quicksand", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        touch: { raw: "(pointer: coarse)" },
        notouch: { raw: "(pointer: fine)" },
      },
    },
    fontFamily: {
      display: ["Oswald", "sans"],
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
