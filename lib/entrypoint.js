#!/usr/bin/env node

const cli = require('./cli')
const dev = require('.')

const {
    script,
    scriptArgs,
    nodeArgs,
    opts
} = cli(process.argv)

dev(script, scriptArgs, nodeArgs, opts)
