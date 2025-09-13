import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: false,
    hmr: {
      overlay: false,
      port: 5174, // Use different port for HMR to avoid conflicts
    },
    watch: {
      // On Windows/OneDrive environments, file events can be noisy; enable polling and ignore common dirs
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/dist/**',
        '**/build/**',
        '**/public/**',
        '**/.next/**',
        '**/tmp/**',
        '**/.cache/**'
      ],
    },
  },
  plugins: [
    react(), 
    // Only use component tagger in development, but with strict conditions
    mode === "development" && process.env.NODE_ENV !== 'production' && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lovable-tagger'], // Exclude problematic dependency
  },
}));
