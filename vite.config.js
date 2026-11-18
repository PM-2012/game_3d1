import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  // ВАЖНО: Указываем имя твоего репозитория, чтобы GitHub Pages правильно грузил ресурсы
  base: '/game_3d1/', 

  plugins: [
    react(),
    {
      name: 'save-map-plugin',
      configureServer(server) {
        server.middlewares.use('/api/save-map', (req, res) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const filePath = path.resolve(__dirname, 'src/mapData.json')
                fs.writeFileSync(filePath, JSON.stringify(JSON.parse(body), null, 2))
                res.statusCode = 200
                res.end('OK')
              } catch (err) {
                res.statusCode = 500
                res.end('Error saving file')
              }
            })
          } else {
            res.statusCode = 405
            res.end('Method Not Allowed')
          }
        })
      }
    }
  ]
})