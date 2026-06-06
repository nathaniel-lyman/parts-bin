import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const HEX = /#[0-9a-fA-F]{3,8}\b/
const FUNC = /\b(rgb|rgba|hsl|hsla)\s*\(/

export function findRawColors(path, contents) {
  if (path.replace(/\\/g, '/').includes('src/theme/')) return []
  const hits = []
  contents.split('\n').forEach((line, i) => {
    if (HEX.test(line) || FUNC.test(line)) hits.push({ path, line: i + 1, text: line.trim() })
  })
  return hits
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (/\.(tsx?|css)$/.test(name)) acc.push(p)
  }
  return acc
}

// run as CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const files = walk('src').filter((f) => !f.replace(/\\/g, '/').includes('src/theme/'))
  const all = files.flatMap((f) => findRawColors(f, readFileSync(f, 'utf8')))
  if (all.length) {
    console.error('Raw colors found outside src/theme/ (use tokens instead):')
    for (const h of all) console.error(`  ${h.path}:${h.line}  ${h.text}`)
    process.exit(1)
  }
  console.log('lint:theme OK — no raw colors outside src/theme/')
}
