#!/usr/bin/env node

import { cli } from './cli.js'
import { dev } from './index.js'

const {
    script,
    scriptArgs,
    nodeArgs,
    opts
} = cli(process.argv)

dev(script, scriptArgs, nodeArgs, opts)
