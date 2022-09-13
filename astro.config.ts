import { defineConfig } from "astro/config";
import mdx from '@astrojs/mdx';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://pcodenver.com",
  integrations: [
    tailwind({ config: { applyBaseStyles: false } }),
    mdx()
  ],
  vite: {
    ssr: {
      external: ["svgo"],
    },
  },
});
