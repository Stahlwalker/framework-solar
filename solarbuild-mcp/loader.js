import { readdir } from 'fs/promises'
import { resolve, join } from 'path'

export async function loadComponents(componentsPath) {
  const absPath = resolve(process.cwd(), componentsPath)
  const files = await readdir(absPath)
  const jsFiles = files.filter(f => f.endsWith('.js'))
  await Promise.all(jsFiles.map(f => import(join(absPath, f))))
}
