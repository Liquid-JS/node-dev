process.on('uncaughtException', e => {
    setTimeout(() => console.log('async', e), 100)
})

foo() // undefined / throws exception
