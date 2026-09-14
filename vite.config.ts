import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

const disabledState =
  'disabled:opacity-50! disabled:cursor-not-allowed! ' +
  'aria-disabled:opacity-50! aria-disabled:cursor-not-allowed! ' +
  'data-[disabled]:opacity-50! data-[disabled]:cursor-not-allowed!'

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
                'cursor-pointer! rounded-none! px-4! py-2! text-base!',
                disabledState,
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
                'rounded-none! border-none! border-0! bg-muted!',
                disabledState,
              ],
            },
          },
          contextMenu: {
            slots: {
              content: 'border-none! rounded-none! hover:cursor-pointer',
              item: 'before:rounded-none!'
            }
          },
          textarea: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted!',
                disabledState,
              ],
            },
          },
          select: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted! hover:cursor-pointer! text-base!',
                disabledState,
              ],
              value: 'text-default text-sm!',
              content: 'bg-muted! rounded-none!',
              item: [
                'before:rounded-none hover:cursor-pointer!'
              ]
            }
          },
          checkbox: {
            slots: {
              base: [
                'rounded-none! hover:cursor-pointer!',
                disabledState,
              ]
            },
            variants: {
              size: {
                xl: {
                  base: 'size-7',
                  icon: 'size-5',
                  container: 'h-8',
                  wrapper: 'text-base',
                  root: 'items-center'
                }
              }
            }
          },
          selectMenu: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted! hover:cursor-pointer!',
                disabledState,
              ],
              value: 'text-default text-sm!',
              content: 'bg-muted! rounded-none!',
              item: [
                'before:rounded-none hover:cursor-pointer!'
              ]
            }
          },
          dropdownMenu: {
            slots: {
              content: 'mt-0 bg-muted rounded-none border-none',
              item: 'before:rounded-none cursor-pointer!',
            }
          },
          modal: {
            slots: {
              content: 'rounded-none! border-none!',
              title: 'text-default!',
              overlay: 'bg-black/60!'
            }
          },
          fileUpload: {
            slots: {
              base: [
                'rounded-none! border-none! border-0! bg-muted! hover:bg-elevated! hover:cursor-pointer!',
                disabledState,
              ]
            }
          },
          tabs: {
              slots: {
                root: 'rounded-none!',
                list: 'rounded-none! hover:cursor-pointer!',
                indicator: 'rounded-none!'
              }
          },
          progress: {
            slots: {
              base: 'rounded-none!',
              indicator: 'rounded-none!'
            }
          },
          toast: {
            slots: {
              root: 'rounded-none!',
              wrapper: 'rounded-none!',
              progress: 'rounded-none! p-0'
            }
          },
          colorPicker: {
            slots: {
              selectorBackground: 'rounded-none!',
              selector: 'rounded-none!',
              track: 'rounded-none!'
            }
          },
          popover: {
            slots: {
              content: 'rounded-none!'
            }
          },
          slideover: {
            slots: {
              header: 'bg-elevated!',
              overlay: 'bg-black/60!'
            }
          }
        }
      }
    )
  ],
})