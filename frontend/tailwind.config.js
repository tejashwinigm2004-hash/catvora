export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',      // main text
        paper: '#FFFFFF',    // white sections
        mist: '#F2F2F2',     // light grey sections
        leaf: '#FFFFFF',     // cards
        accent: '#FF9900',   // buttons (unchanged)
        accent2: '#EC7211',  // button hover (unchanged)
        peach: '#FFE9DB',
        peach2: '#FFD8BF',
        pline: '#F3C3A3',
        cobalt: '#0067B8',   // links and highlights
        mint: '#17B8E8',
      },
      fontFamily: {
        display: ['"Segoe UI"', '"Segoe UI Variable"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
        sans: ['"Segoe UI"', '"Segoe UI Variable"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
    },
  },
};