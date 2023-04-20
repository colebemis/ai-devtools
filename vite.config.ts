import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babelPlugin from "./devtools/babel-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [babelPlugin],
      },
    }),
  ],
});
