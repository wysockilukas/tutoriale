const EventEmitter = require('events')
const http = require('http');


// const myEmitter = new EventEmitter();

class Sales extends EventEmitter {
    constructor() {
        super();
    }
}

const myEmitter = new Sales();


//to sa listenery -czekaja na event emiter
myEmitter.on('newSale', ()=> {
    console.log('Bylo newSale')
})
myEmitter.on('newSale', ()=> {
    console.log('Bylo newSale inny listener')
})

myEmitter.on('newSale', ( stock )=> {
    console.log('Bylo newSale z parametrem ', stock)
})


// A to jest emitter
myEmitter.emit('newSale', 1)
setTimeout(() => {
    myEmitter.emit('newSale',2 )
}, 2000);



const server = http.createServer();

server.on('request', (req,res) => {
    console.log('byl request');
    res.writeHead(200, { 'Conten-type': 'text/html' });
    res.end( 'O!!!');
})

server.on('request', (req,res) => {
    console.log('byl request 2 ');
    res.writeHead(200, { 'Conten-type': 'text/html' });
    res.end( 'Z Z Z');
})

server.on('close', (req,res) => {
    console.log('KONIEC');
})

server.listen(8000, '127.0.0.1');
  
