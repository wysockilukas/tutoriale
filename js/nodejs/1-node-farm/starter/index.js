const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const pageOveriew = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const pageProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const pageCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

const productHTML = replaceTemplate(pageProduct, dataObj);
const cardHTML = replaceTemplate(pageCard, dataObj);

const overwiewHTML = pageOveriew.replace('{%PRODUCT_CARD%}', cardHTML.join('<br />'));
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Conten-type': 'text/html' });
    res.end(overwiewHTML);
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Conten-type': 'text/html' });
    res.end(productHTML[query.id]);
  } else if (pathname === '/test') {
    const resJson = {
      headers: { ...req.headers },
      httpVersion: { ...req.httpVersion },
      url: { ...req.url },
      method: { ...req.method },
      statusMessage: { ...req.statusMessage },
    };
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(resJson));
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, { 'Conten-type': 'text/text' });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Wystartowała na porcie 8000');
});

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
