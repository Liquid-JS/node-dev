import tap from 'tap'

import { cli } from '../lib/cli.js'

tap.test('notify is enabled by default', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', 'test/index.mjs'])

    t.equal(notify, true)
    t.end()
})

tap.test('--no-notify', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', '--no-notify', 'test/index.mjs'])

    t.equal(notify, false)
    t.end()
})

tap.test('--notify=false', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', '--notify=false', 'test/index.mjs'])

    t.equal(notify, false)
    t.end()
})

tap.test('--notify', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', '--notify', 'test/index.mjs'])

    t.equal(notify, true)
    t.end()
})

tap.test('--notify=true', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', '--notify=true', 'test/index.mjs'])

    t.equal(notify, true)
    t.end()
})

tap.test('notify can be disabled by .node-dev.json', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', 'test/fixture/server.js'])

    t.equal(notify, false)
    t.end()
})

tap.test('cli overrides .node-dev.json from false to true', t => {
    const {
        opts: { notify }
    } = cli(['node', 'lib/entrypoint.js', '--notify=true', 'test/fixture/server.js'])

    t.equal(notify, true)
    t.end()
})

tap.test('-r ts-node-maintained/register --inspect test/fixture/server.js', t => {
    const argv = 'node lib/entrypoint.js -r ts-node-maintained/register --inspect test/fixture/server.js'.split(' ')
    const { nodeArgs } = cli(argv)
    t.same(nodeArgs, ['--inspect', '--require=ts-node-maintained/register'])
    t.end()
})

tap.test('--inspect -r ts-node-maintained/register test/fixture/server.js', t => {
    const argv = 'node lib/entrypoint.js --inspect -r ts-node-maintained/register test/fixture/server.js'.split(' ')
    const { nodeArgs } = cli(argv)
    t.same(nodeArgs, ['--inspect', '--require=ts-node-maintained/register'])
    t.end()
})

tap.test('--expose_gc gc.js foo', t => {
    const argv = 'node lib/entrypoint.js --expose_gc test/fixture/gc.js foo'.split(' ')
    const { nodeArgs } = cli(argv)
    t.same(nodeArgs, ['--expose_gc'])
    t.end()
})

tap.test('--preserve-symlinks test', t => {
    const argv = 'node lib/entrypoint.js --preserve-symlinks test/index.mjs'.split(' ')
    const { nodeArgs } = cli(argv)
    t.same(nodeArgs, ['--preserve-symlinks'])
    t.end()
})

tap.test('clear is not enabled by default', t => {
    const {
        opts: { clear }
    } = cli(['node', 'lib/entrypoint.js', 'test/index.mjs'])

    t.notOk(clear)
    t.end()
})

tap.test('--clear enables clear', t => {
    const {
        opts: { clear }
    } = cli(['node', 'lib/entrypoint.js', '--clear', 'test/index.mjs'])

    t.ok(clear)
    t.end()
})

tap.test('interval default', t => {
    const {
        opts: { interval }
    } = cli(['node', 'lib/entrypoint.js', 'test/index.mjs'])

    t.equal(interval, 1000)
    t.end()
})

tap.test('--interval=2000', t => {
    const {
        opts: { interval }
    } = cli(['node', 'lib/entrypoint.js', '--interval=2000', 'test/index.mjs'])

    t.equal(interval, 2000)
    t.end()
})

tap.test('debounce default', t => {
    const {
        opts: { debounce }
    } = cli(['node', 'lib/entrypoint.js', 'test/index.mjs'])

    t.equal(debounce, 10)
    t.end()
})

tap.test('--debounce=2000', t => {
    const {
        opts: { debounce }
    } = cli(['node', 'lib/entrypoint.js', '--debounce=2000', 'test/index.mjs'])

    t.equal(debounce, 2000)
    t.end()
})

tap.test('--require source-map-support/register', t => {
    const { nodeArgs } = cli([
        'node',
        'lib/entrypoint.js',
        '--require',
        'source-map-support/register',
        'test/index.mjs'
    ])

    t.same(nodeArgs, ['--require=source-map-support/register'])
    t.end()
})

tap.test('--require=source-map-support/register', t => {
    const { nodeArgs } = cli([
        'node',
        'lib/entrypoint.js',
        '--require=source-map-support/register',
        'test/index.mjs'
    ])

    t.same(nodeArgs, ['--require=source-map-support/register'])
    t.end()
})

tap.test('-r source-map-support/register', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-r', 'source-map-support/register', 'test/index.mjs'])

    t.same(nodeArgs, ['--require=source-map-support/register'])
    t.end()
})

tap.test('-r=source-map-support/register', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-r=source-map-support/register', 'test/index.mjs'])

    t.same(nodeArgs, ['--require=source-map-support/register'])
    t.end()
})

tap.test('--inspect=127.0.0.1:12345', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '--inspect=127.0.0.1:12345', 'test/index.mjs'])

    t.same(nodeArgs, ['--inspect=127.0.0.1:12345'])
    t.end()
})

tap.test('--inspect', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '--inspect', 'test/index.mjs'])

    t.same(nodeArgs, ['--inspect'])
    t.end()
})

tap.test('--no-warnings', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '--no-warnings', 'test/index.mjs'])

    t.same(nodeArgs, ['--no-warnings'])
    t.end()
})

tap.test('--require source-map-support/register --require ts-node-maintained/register', t => {
    const { nodeArgs } = cli([
        'node',
        'lib/entrypoint.js',
        '--require',
        'source-map-support/register',
        '--require',
        'ts-node-maintained/register',
        'test/index.mjs'
    ])

    t.same(nodeArgs, ['--require=source-map-support/register', '--require=ts-node-maintained/register'])
    t.end()
})

// This should display usage information at some point
tap.test('No script or option should fail', t => {
    t.throws(() => cli(['node', 'lib/entrypoint.js']))
    t.end()
})

tap.test('Just an option should fail', t => {
    t.throws(() => cli(['node', 'lib/entrypoint.js', '--option']))
    t.end()
})

tap.test('Just an option with a value should fail', t => {
    t.throws(() => cli(['node', 'lib/entrypoint.js', '--option=value']))
    t.end()
})

tap.test('An unknown argument with a value instead of a script should fail.', t => {
    t.throws(() => cli(['node', 'lib/entrypoint.js', '--unknown-arg', 'value']))
    t.end()
})

tap.test('An unknown argument with a value', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '--unknown-arg=value', 'test/index.mjs'])

    t.same(nodeArgs, ['--unknown-arg=value'])
    t.end()
})

tap.test('An unknown argument without a value can use -- to delimit', t => {
    // use -- to delimit the end of options
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '--unknown-arg', '--', 'test/index.mjs'])

    t.same(nodeArgs, ['--unknown-arg'])
    t.end()
})

tap.test('Single dash with value', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-u', 'value', 'test/index.mjs'])

    t.same(nodeArgs, ['-u=value'])
    t.end()
})

tap.test('Single dash with = and value', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-u=value', 'test/index.mjs'])

    t.same(nodeArgs, ['-u=value'])
    t.end()
})

tap.test('Single dash without value should fail', t => {
    t.throws(() => cli(['node', 'lib/entrypoint.js', '-u', 'test/index.mjs']))
    t.end()
})

tap.test('Single dash without value can use -- to delimit', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-u', '--', 'test/index.mjs'])

    t.same(nodeArgs, ['-u'])
    t.end()
})

tap.test('Repeated single dash', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-u=value1', '-u=value2', 'test/index.mjs'])

    t.same(nodeArgs, ['-u=value1', '-u=value2'])
    t.end()
})

tap.test('Repeated single dash without =', t => {
    const { nodeArgs } = cli(['node', 'lib/entrypoint.js', '-u', 'value1', '-u', 'value2', 'test/index.mjs'])

    t.same(nodeArgs, ['-u=value1', '-u=value2'])
    t.end()
})

tap.test(
    'All command-line arguments that are not `node-dev` options are passed on to the `node` process.',
    t => {
        // Everything except clear gets passed to node.
        // Don't forget to use -- to delimit!
        const argv =
            'node lib/entrypoint.js --all --command-line --arguments --clear --that --are --not --node-dev --options -- test/index.mjs'.split(
                ' '
            )
        const { nodeArgs } = cli(argv)

        t.same(nodeArgs, [
            '--all',
            '--command-line',
            '--arguments',
            '--that',
            '--are',
            '--not',
            '--node-dev',
            '--options'
        ])
        t.end()
    }
)
