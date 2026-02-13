// Source: https://github.com/nodejs/node/issues/30810#issue-533506790

export const suppressExperimentalWarnings = (p: NodeJS.Process) => {
    const { emitWarning, emit } = p

    p.emitWarning = (warning, ...args: any[]) => {
        if (args[0] === 'ExperimentalWarning') {
            return
        }

        if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') {
            return
        }

        return emitWarning(warning, ...args)
    }

    // @ts-ignore
    p.emit = (...args: any[]) => {
        if (args[1]?.name === 'ExperimentalWarning') {
            return
        }

        // @ts-ignore
        return emit.call(p, ...args)
    }
}
