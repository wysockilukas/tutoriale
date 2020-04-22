
const fs = require('fs')
const server = require('http').createServer();

server.on('request', (req, res) => {
    //rozwiazanie 1
    // console.log('Jest request')
    // fs.readFile('./test-file.txt', (err,data) => {
    //     if (err) console.log(err);
    //     res.end(data)
    // })

    //rozwiazanie 2 - stream
    // obiekt res jest write streamem  - backpreasure problem
    // const readable = fs.createReadStream('./test-file.txt');
    // readable.on('data', (chunk)=> {
    //     res.write(chunk);
    // })
    // readable.on('end', ()=>{
    //     res.end();
    // })
    // readable.on('error', (err)=>{
    //     console.log(err)
    //     res.writeHead(500,'Nie ma pliku')
    //     res.end('file not found');
    // })


    //rozwiazanie 3
    const readable = fs.createReadStream('./test-file.txt');
    readable.pipe( res );

    readable.on('end', ()=>{
        res.end();
    })

})

server.on('close', () => {
    console.log('Koniec')
})

server.listen(8000,'127.0.0.1');