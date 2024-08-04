module.exports = {
  prefix: 'twcss-',
  content: [
    './layout/*.liquid',
    './templates/*.liquid',
    './templates/customers/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
  ],
  theme: {
    extend: {
      fontFamily: {
        standard: ['Standard', 'sans-serif'],
        'american-typewriter': ['American Typewriter', 'Courier', 'monospace'],
      },
      colors: {
        'standard-blue': '#2A55EB',
      },
    },
    screens: {
      sm: '320px',
      md: '750px',
      lg: '990px',
      xlg: '1440px',
      x2lg: '1920px',
      pageMaxWidth: '1440px',
    },
  },
  plugins: [],
};
