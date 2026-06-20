import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/marvell20/",
  server: {
    watch: {
      ignored: ["**/.edge-inspect-profile/**"],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        photobooth: resolve(__dirname, "photobooth.html"),
        reservation: resolve(__dirname, "reservation.html"),
      },
    },
  },
});
