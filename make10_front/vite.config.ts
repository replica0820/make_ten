import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // ここに存在するすべてのHTMLファイルを登録します
        main: resolve(__dirname, 'index.html'),
        daily: resolve(__dirname, 'daily/index.html'),
        practice: resolve(__dirname, 'practice/index.html'),
      }
    }
  }
})