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
          },
          tooltip: {
            slots: {
             content: 'h-9 px-4 py-2 text-base text-default border-none bg-muted! rounded-none',
             arrow: 'scale-150 fill-(--ui-bg-muted)'
            }
          },
          input: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted!'
              ]
            }
          },
          modal: {
            slots: {
              content: 'rounded-none! border-none!',
              title: 'text-default!'
            }
          },
          fileUpload: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted! hover:bg-elevated! hover:cursor-pointer!'
              ]
            }
          }
        }
      }
    )
  ],
})
