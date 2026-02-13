import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import debounce from 'debounce'

let outOfFileHandles = false

export interface FileWatcherOptions {
    forcePolling?: boolean
    debounce?: number
    interval?: number
    persistent?: boolean
    fallback?: boolean
}

export class FileWatcher extends EventEmitter {
    private readonly watchers: Record<string, Pick<fs.FSWatcher, 'close'>> = {}
    private polling?: boolean

    constructor(private readonly opts: FileWatcherOptions = {}) {
        super()
        if (opts.debounce === undefined) opts.debounce = 10
        if (opts.persistent === undefined) opts.persistent = true
        if (!opts.interval) opts.interval = 1000
        this.polling = opts.forcePolling
    }

    /**
     * Start watching the given file.
     */
    add(file: string) {
        const self = this

        // don't add files after we ran out of file handles
        if (outOfFileHandles && !this.polling) return

        // ignore files that don't exist or are already watched
        if (this.watchers[file]) return
        fs.stat(file, (e, stat) => {
            if (e) return

            // remember the current mtime
            let mtime = stat.mtime

            // callback for both fs.watch and fs.watchFile
            function check() {
                fs.stat(file, (_, checkStat) => {

                    if (!self.watchers[file]) return

                    // close watcher and create a new one to work around fs.watch() bug
                    // see https://github.com/joyent/node/issues/3172
                    if (!self.polling) {
                        self.remove(file)
                        add(true)
                    }

                    if (!checkStat) {
                        self.emit('change', file, { deleted: true })
                    } else if (checkStat.isDirectory() || checkStat.mtime > mtime) {
                        mtime = checkStat.mtime
                        self.emit('change', file, checkStat)
                    }
                })
            }

            function add(silent?: boolean) {
                if (self.polling) {
                    self.watchers[file] = {
                        close: () => {
                            fs.unwatchFile(file)
                        }
                    }
                    fs.watchFile(file, self.opts, check)
                    return
                }

                try {
                    // try using fs.watch ...
                    self.watchers[file] = fs.watch(file, self.opts,
                        debounce(check, self.opts.debounce)
                    )
                } catch (err: any) {
                    if (err.code == 'EMFILE') {
                        if (self.opts.fallback !== false) {
                            // emit fallback event if we ran out of file handles
                            const count = self.poll()
                            add()
                            self.emit('fallback', count)
                            return
                        }
                        outOfFileHandles = true
                    }
                    if (!silent) self.emit('error', err)
                }
            }

            add()
        })
    }

    /**
     * Switch to polling mode. This method is invoked internally if the system
     * runs out of file handles.
     */
    poll() {
        if (this.polling) return 0
        this.polling = true
        const watched = Object.keys(this.watchers)
        this.removeAll()
        watched.forEach(this.add, this)
        return watched.length
    }

    /**
     * Lists all watched files.
     */
    list() {
        return Object.keys(this.watchers)
    }

    /**
     * Stop watching the given file.
     */
    remove(file: string) {
        const watcher = this.watchers[file]
        if (!watcher) return
        delete this.watchers[file]
        watcher.close()
    }

    /**
     * Stop watching all currently watched files.
     */
    removeAll() {
        this.list().forEach(this.remove, this)
    }
}
