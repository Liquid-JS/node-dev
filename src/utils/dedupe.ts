import crypto from 'node:crypto'
import fs from 'node:fs'
import NodeModule from 'node:module'
import path from 'node:path'

// @ts-ignore
const rawExtensions: NodeJS.RequireExtensions = NodeModule._extensions

let loadeds: Record<string, { file: string, module: NodeJS.Module }> = {}
const extensions = { ...rawExtensions }

function getHash(data: crypto.BinaryLike) {
    return crypto
        .createHash('md5')
        .update(data)
        .digest('hex')
}

/**
 * Activates deduping for files with the given extension.
 *
 * @name activate
 * @function
 * @param ext {String} (optional) extension for which to activate deduping (default: '.js')
 * @param subdirs {Number} (optional) how many subdirs right above the module
 *    have to be the same in order for it to be considered identical  (default: 2)
 *
 *  Example: sudirs: 2 -- x/foo/bar/main.js === y/foo/bar/main.js
 *                        x/boo/bar/main.js !== y/foo/bar/main.js
 */
const activate = (ext?: string, subdirs?: number) => {
    ext = ext || '.js'
    subdirs = typeof subdirs === 'undefined' ? 2 : subdirs

    const ext_super = rawExtensions[ext]

    rawExtensions[ext] = function dedupingExtension(module, file) {

        const src = fs.readFileSync(file, 'utf8')

        // hash includes filename and subdir name(s) to make override more strict
        const fulldir = path.dirname(file)
        const dirs = fulldir.split(path.sep)
        let dir = ''

        for (let i = subdirs; i > 0 && dirs.length; i--) dir = dirs.pop() + dir

        const filename = path.basename(file)
        const hash = getHash(src + dir + filename)

        const loaded = loadeds[hash]
        if (loaded) {
            module.exports = loaded.module.exports
        } else {
            ext_super?.(module, file)
            loadeds[hash] = { file, module }
        }
    }
}

/**
 * Deactivates deduping files with the given extension.
 *
 * @name deactivate
 * @function
 * @param ext {String} (optional) extension for which to activate deduping (default: '.js')
 */
export const deactivate = (ext: string) => {
    ext = ext || '.js'
    rawExtensions[ext] = extensions[ext]
}

/**
 * Clears the registry that contains previously loaded modules.
 *
 * @name reset
 * @function
 */
export const reset = () => {
    loadeds = {}
}

activate()
