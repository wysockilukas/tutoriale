const fs = require('fs')
const http = require('http');
const url = require('url');





const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data)
const pageOveriew = fs.readFileSync(`${__dirname}/templates/template-overview.html`)
const pageProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`)
const pageCard = fs.readFileSync(`${__dirname}/templates/template-card.html`)

const productHTML = [];
const cardHTML = [];


dataObj.forEach( (page) => {
    let oneProductPage = pageProduct
    let oneCardPage = pageCard
    Object.keys(page).forEach( (param) => {
        const find = `{%${param}%}`
        oneProductPage = oneProductPage.toString().replace(  new RegExp(find,'g')   , page[param])
        oneCardPage = oneCardPage.toString().replace(  new RegExp(find,'g')   , page[param])
    })
    productHTML.push(oneProductPage)
    cardHTML.push(oneCardPage)
})

const find = '{%PRODUCT_CARD%}'
const overwiewHTML = pageOveriew.toString().replace(  new RegExp(find,'g')   , cardHTML.join('<br />'))



const server = http.createServer((req, res) => {

    const pathname = req.url;

    if (pathname === "/") {
        // res.end(productHTML[3])
        res.end( overwiewHTML  )

    } else if (pathname === '/test') {
        const resJson = {
            headers: {
                ...req.headers
            },
            httpVersion: {
                ...req.httpVersion
            },
            url: {
                ...req.url
            },
            method: {
                ...req.method
            },
            statusMessage: {
                ...req.statusMessage
            },

        }
        res.writeHead(200, {
            'Content-type': 'application/json'
        })
        res.end(JSON.stringify(resJson))
    } else if (pathname === '/api') {
        res.writeHead(200, {
            'Content-type': 'application/json'
        })
        res.end(data)
    } else {
        res.writeHead(404, {
            'Conten-type': 'text/text'
        })
        res.end('<h1>Page not found</h1>')
    }




})

server.listen(8000, '127.0.0.1', () => {
    console.log('Wystartowała na porcie 8000')
})


/*
//sync
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
const data = new Date().toLocaleString('pl')
const textOut = `Wiemy o awokado, że:\n ${textIn}\n\n\tUtworzony ${data}`;

fs.writeFileSync('./txt/output.txt', textOut)


//asyn
fs.readFile('./txt/start.txt', 'utf-8', (err, data) => {
    console.log(data)
})
*/