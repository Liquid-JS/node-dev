import { format } from 'node:util'
import dateformat from 'dateformat'

const colors = {
    error: '31;1',
    info: '36',
    warn: '33'
}

const LOG_LEVELS = Object.keys(colors) as Array<keyof typeof colors>

export type Log = { [K in keyof typeof colors]: (...args: any[]) => string }

const noop = <T>(s: T) => s
const colorOutput = (s: string, c: string) => '\x1B[' + c + 'm' + s + '\x1B[0m'

/**
 * Logs a message to the console. The level is displayed in ANSI colors:
 * errors are bright red, warnings are yellow, and info is cyan.
 */
export const logFactory = ({ noColor, timestamp }: { noColor?: boolean, timestamp: string }) => {
    const enableColor = !(noColor || !process.stdout.isTTY)
    const color = enableColor ? colorOutput : noop

    const log = (msg: any, level: typeof LOG_LEVELS[0]) => {
        const ts = timestamp ? color(dateformat(new Date(), timestamp), '39') + ' ' : ''
        const c = colors[level] || '32'
        const output = `[${color(level.toUpperCase(), c)}] ${ts}${msg}`
        console.log(output)
        return output
    }

    const _logFactory = (level: typeof LOG_LEVELS[0]) =>
        (...args: any[]) => log(format.apply(null, args), level)

    return LOG_LEVELS.reduce((logMap, level) => {
        logMap[level] = _logFactory(level)
        return logMap
    }, {} as Log)
}
