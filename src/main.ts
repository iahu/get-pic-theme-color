import ffmpeg from 'fluent-ffmpeg'
import Jimp from 'jimp'

function resolve(path: string): Promise<string> {
  const isWebp = path.endsWith('.webp')
  const tempPath = `${path}.png`

  if (isWebp) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(path)
        .output(tempPath)
        .on('error', reject)
        .on('end', () => resolve(tempPath))
        .run()
    })
  }
  return Promise.resolve(path)
}

const getSamples = (img: Jimp) => {
  const w = img.getWidth()
  const h = img.getHeight()

  return [
    img.getPixelColor(0, 0),
    img.getPixelColor(0, w),
    img.getPixelColor(h / 2, w / 2),
    img.getPixelColor(0, w),
    img.getPixelColor(h, w),
  ]
}

const getAvgColor = (simples: number[]) => {
  const rgba = simples.reduce(
    (acc, item) => {
      const { r, g, b, a } = Jimp.intToRGBA(item)
      acc.r += r
      acc.g += g
      acc.b += b
      acc.a += a
      return acc
    },
    { r: 0, g: 0, b: 0, a: 0 }
  )

  return {
    r: rgba.r / 5,
    g: rgba.g / 5,
    b: rgba.b / 5,
    a: rgba.a / 5,
  }
}

export default function getThemeColor(path: string) {
  return resolve(path)
    .then(Jimp.read)
    .then(img => {
      const w = img.getWidth()
      const h = img.getHeight()
      const max = Math.max(w, h)
      const f = 40 / max
      return img.scale(f)
    })
    .then(img => img.gaussian(20))
    .then(img => getSamples(img))
    .then(getAvgColor)
}
