import resolve from 'resolve'

export const resolveMain = (main: string) => {
    const basedir = process.cwd()
    const paths = [basedir]
    return resolve.sync(main, { basedir, paths })
}
