const control = '\u001bc'
const clearFactory = (clear?: boolean) => (clear ? () => process.stdout.write(control) : () => { })

export { clearFactory, control }
