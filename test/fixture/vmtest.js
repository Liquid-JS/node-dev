const { readFileSync } = require('node:fs')
const server = require('node:http').createServer().listen(0)
const { join } = require('node:path')
const vm = require('node:vm')

const file = join(__dirname, 'log.js')
const str = readFileSync(file, 'utf8')

if (process.argv.length > 2 && process.argv[2] === 'nofile') {
    vm.runInNewContext(str, { module: {}, require, console })
} else {
    vm.runInNewContext(str, { module: {}, require, console }, file)
}

process.once('SIGTERM', () => server.close())

process.once('beforeExit', () => console.log('exit'))
