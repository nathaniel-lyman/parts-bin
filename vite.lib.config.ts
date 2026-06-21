/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const external = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  '@tanstack/react-table',
  '@tanstack/react-virtual',
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-markdown',
  'recharts',
  'remark-gfm',
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/components/index.ts'),
        datagrid: resolve(__dirname, 'src/components/DataGrid/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external,
    },
  },
})
