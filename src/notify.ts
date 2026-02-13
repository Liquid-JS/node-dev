import notifier from 'node-notifier'
import { localPath } from './local-path.js'
import { Log } from './log.js'

const iconLevelPath = (level: 'error' | 'info') => localPath(`../icons/node_${level}.png`)

// Writes a message to the console and optionally displays a desktop notification.
export const notifyFactory = (notifyEnabled: boolean, log: Log) => (title = 'node-dev', message: any, level: 'error' | 'info' = 'info') => {
    log[level](`${title}: ${message}`)

    if (notifyEnabled) {
        notifier.notify({
            title,
            icon: iconLevelPath(level),
            message
        })
    }
}
