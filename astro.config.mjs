import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tctvweb.com',
  output: 'server',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
