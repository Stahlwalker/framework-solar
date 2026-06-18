#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()) }))
}

function copyDir(src, dest, name) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, name)
    } else {
      const content = fs.readFileSync(srcPath, 'utf8').replaceAll('{{PROJECT_NAME}}', name)
      fs.writeFileSync(destPath, content)
    }
  }
}

const arg = process.argv[2]
const defaultName = arg || 'my-solar-app'

console.log('\nsolarbuild — create a new project\n')

let projectName = arg || await prompt(`Project name (${defaultName}): `)
if (!projectName) projectName = defaultName

const targetDir = path.resolve(process.cwd(), projectName)

if (fs.existsSync(targetDir)) {
  console.error(`\nError: directory "${projectName}" already exists.\n`)
  process.exit(1)
}

const templateDir = path.join(__dirname, 'template')
copyDir(templateDir, targetDir, projectName)

// Copy Solar framework into project as solar/
const frameworkSrc = path.join(__dirname, 'framework')
const frameworkDest = path.join(targetDir, 'solar')
copyDir(frameworkSrc, frameworkDest, projectName)

console.log(`\nCreated ${projectName}/\n`)
console.log('Next steps:\n')
console.log(`  cd ${projectName}`)
console.log('  npx serve .\n')
console.log('Or open index.html directly in your browser.\n')
