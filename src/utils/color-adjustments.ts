export default function adjustLightness(hex: string, amount: number) {
  // hex: "#3498db"
  // amount: -100 to 100
  const num = parseInt(hex.slice(1), 16)

  let r = (num >> 16) & 255
  let g = (num >> 8) & 255
  let b = num & 255

  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h: number = 0;
  let s: number = 0;
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  const newL = Math.max(0, Math.min(1, l + amount / 100))

  return hslToHex(h * 360, s * 100, newL * 100)
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r, g, b

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return `#${[r, g, b]
    .map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0'))
    .join('')}`
}