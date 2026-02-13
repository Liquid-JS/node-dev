import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url))
export const localPath = (f: string) => join(__dirname, f)
