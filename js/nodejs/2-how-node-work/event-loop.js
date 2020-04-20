const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1;

//Te kody nie pracują w event loop bo nie sa wewnatrz callback functoion
setTimeout( () => console.log('Timer 1 koniec'), 0);
setImmediate(()=>console.log('Immediate 1 koniec'));



// A te juz tak
fs.readFile('./test-file.txt', 'utf-8', (err,data) => {
    console.log('I/O koniec 1');
    console.log('----------------------')
    setTimeout( () => console.log('Timer 2 koniec'), 0);
    setTimeout( () => console.log('Timer 3 koniec'), 3000);
    setImmediate(()=>console.log('Immediate 2 koniec'));


    //gdyby uruchomic to szyfrowanie synchronicznie to timer 3 zaczekałby ze startem az sie skonczy
    // synchroniczbne sa poza evenbt loop

    process.nextTick(( ) => console.log('process.nextTick 1') )
    // process.nextTick(( ) => console.log('process.nextTick 2') )
    // process.nextTick(( ) => console.log('process.nextTick 3') )
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 1');
    })
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 2');
    })
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 3');
    })  
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 4');
    })      
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 5');
    })   
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now() - start, 'Password encypted 6');
    })  
})

// setTimeout( () => console.log('Timer 4 koniec'), 1000*60*60);


console.log('Top level code');

