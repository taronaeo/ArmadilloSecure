import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocessReact from 'svelte-preprocess-react/preprocessReact';

const config = {
  preprocess: [vitePreprocess({}), preprocessReact()],
};

export default config;
