import type { Config } from 'tailwindcss';
import preset from './src/styles/tailwind.preset.mythic-forge.js';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
} satisfies Config;
