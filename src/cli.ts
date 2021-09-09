import fs from 'fs'
import glob from 'glob'
import cliProgress from 'cli-progress'
import getThemeColor from './main'
import ProHub from './prohub'

const [path] = process.argv.slice(2)
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

glob(path, function (err, matches) {
  const total = matches.length

  console.log(`共 ${total} 个文件`)
  if (total > 0) {
    bar.start(total, 0)
  }

  const tasks = [] as (() => Promise<any>)[]
  const result = new Map()
  const error = {} as Record<string, any>

  matches.forEach(path => {
    const task = () =>
      getThemeColor(path)
        .then(themeColor => {
          if (themeColor) {
            const { r, g, b, a } = themeColor
            result.set(path.split(/[\\/]/g).pop(), `rgba(${r}, ${g}, ${b}, ${a})`)
          } else {
            result.set(path, '')
          }

          bar.update(result.size)
          if (result.size === total) {
            bar.stop()
            try {
              fs.writeFileSync('./output.json', JSON.stringify(Object.fromEntries(result)))
              fs.writeFileSync('./error.json', JSON.stringify(error))
              console.log('完成！')
            } catch (e) {
              return e
            }
          }
        })
        .catch(err => {
          console.error(err)
          error[path] = err.toString()
        })

    tasks.push(task)
  })

  new ProHub(tasks, 10).start()
})
