const fs = require('fs');
// const server = require('http').createServer();
const superagent = require('superagent');

fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  // 1 callback
  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`).end((err, res) => {
    // 2 callback
    if (err) return console.log(err.message);
    fs.writeFile('dog-img.txt', res.body.message, (err) => {
      // 3 callback
    });
  });
});
