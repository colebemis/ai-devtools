import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import inspect from "vite-plugin-inspect";
import babelPlugin from "./devtools/babel-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [babelPlugin],
      },
    }),
    inspect(),
  ],
});
