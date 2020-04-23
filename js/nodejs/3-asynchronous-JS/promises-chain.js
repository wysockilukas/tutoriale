const fs = require('fs');
// const server = require('http').createServer();
const superagent = require('superagent');


const readFilePro = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/${fileName}`, 'utf-8', (err, data) => {
            if (err) reject(err.message + ' i moj komunikat');
            resolve(data);
        })
    })
}
const writeFilePro = (fileName, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, data, (err) => {
            if (err) reject(err.message);
            resolve('jest Ok')
        });
    })
}

readFilePro('dog.txt')
    .then(res => {
        return superagent.get(`https://dog.ceo/api/breed/${res}/images/random`)
    })
    .then(res => {
        // writeFilePro('dog-img.txt', res.body.message)
        return writeFilePro('dog-img.txt', res.body.message)
    }).then(res => console.log(res)) //ten ostatni then nie byłby konieczny gdy wyzej nie bylo return
    .catch(err => {
        console.log(err);
    })