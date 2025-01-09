const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Adjust paths to match your project structure
    './node_modules/@shadcn/ui/**/*.js',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
                    ...fontFamily.sans
                ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
      require("tailwindcss-animate")
],
};
