import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tctvweb.com',
  output: 'static',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
