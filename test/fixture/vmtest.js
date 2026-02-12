const { readFileSync } = require('fs')
const server = require('http').createServer().listen(0)
const { join } = require('path')
const vm = require('vm')

const file = join(__dirname, 'log.js')
const str = readFileSync(file, 'utf8')

if (process.argv.length > 2 && process.argv[2] === 'nofile') {
    vm.runInNewContext(str, { module: {}, require, console })
} else {
    vm.runInNewContext(str, { module: {}, require, console }, file)
}

process.once('SIGTERM', () => server.close())

process.once('beforeExit', () => console.log('exit'))
