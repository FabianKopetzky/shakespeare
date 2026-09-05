import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    ui(
      {
        ui: {
          button: {
            slots: {
              base: [
                'cursor-pointer! rounded-none! px-4! py-2! text-base!'
              ]
            },
            variants: {
              size: {
                xl: {
                  base: "px-6! py-3! text-lg!"
                }
              }
            }
          }
        }
      }
    )
  ],
})
