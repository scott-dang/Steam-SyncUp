/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./node_modules/flowbite/**/*.js/*.tsx"
	],
	theme: {
		extend: {
			colors: {
				grayprimary: '#121212',
				graysecondary: '#282828'
			}
		},
	},
};
