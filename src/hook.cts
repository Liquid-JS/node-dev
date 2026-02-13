import vm from 'vm'
import NodeModule from 'node:module'

export const hook = (patchVM: boolean, callback: (file: string) => void) => {
    // Hook into Node's `require(...)`
    updateHooks()

    // Patch the vm module Script class to watch files executed as vm scripts:
    if (patchVM) {
        vm.Script = class Script extends vm.Script {
            constructor(...args: any[]) {
                const opts = args[1]
                let file: string | undefined
                if (opts) {
                    file = typeof opts === 'string' ? opts : opts.filename
                }
                if (file) callback(file)
                // @ts-ignore
                super(...args)
            }
        }
    }

    /**
     * (Re-)install hooks for all registered file extensions.
     */
    function updateHooks() {
        // @ts-ignore
        const extensions: NodeJS.RequireExtensions = NodeModule._extensions
        Object.keys(extensions).forEach(ext => {
            const fn = extensions[ext]
            if (typeof fn === 'function' && fn.name !== 'nodeDevHook') {
                extensions[ext] = createHook(fn)
            }
        })
    }

    /**
     * Returns a function that can be put into `NodeModule._extensions` in order to
     * invoke the callback when a module is required for the first time.
     */
    function createHook(handler: (module: NodeJS.Module, filename: string) => any) {
        return function nodeDevHook(module: NodeJS.Module, filename: string) {
            if (!module.loaded) callback(module.filename)

            // Invoke the original handler
            handler(module, filename)

            // Make sure the module did not hijack the handler
            updateHooks()
        }
    }
}
