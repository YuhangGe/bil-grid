/* global process */

const isDemo = process.argv.includes('demo');

/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: isDemo ? ['./src/**/*.tsx', './demo/**/*.tsx'] : ['./src/**/*.tsx'],
};
