const server = require('node:http').createServer().listen(0)
console.log(process.pid)
process.once('SIGTERM', () => server.close())
