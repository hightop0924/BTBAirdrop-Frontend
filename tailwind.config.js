const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
    colors: {
      "custom-heavy-white": "#FFF1",
      "custom-medium-white": "#FFF6",
      "custom-light-white": "#FFFFFF08",
      "custom-yellow": "#FABE7A",
      "custom-blue": "#019FC6",
      "custom-green": "#01C6A3",
      "custom-red": "#C6016A",
      white: "#ffffff",
      purple: "#3f3cbb",
      midnight: "#121063",
      metal: "#565584",
      tahiti: "#3ab7bf",
      silver: "#ecebff",
      "bubble-gum": "#ff77e9",
      bermuda: "#78dcca",
    },
  },
  plugins: [],
});
