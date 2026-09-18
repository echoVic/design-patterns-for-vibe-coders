import { defineConfig } from 'vite'

export default defineConfig({
  // 每个版本是一个独立目录，直接按路径访问：/v0.1/、/v0.2/
  root: '.',
  server: { port: 5180, open: '/v0.2/' },
})
