const fs = require('fs');
// const server = require('http').createServer();
const superagent = require('superagent');

const readFilePro = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/${fileName}`, 'utf-8', (err, data) => {
      if (err) reject(err.message + ' i moj komunikat');
      resolve(data);
    });
  });
};
const writeFilePro = (fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (err) => {
      if (err) reject(err.message);
      resolve('jest Ok');
    });
  });
};

/*
To działa tak:
tworzymy funkcje z polceniem async - co ozacza ze funkcja bedzie asynchroniczna
ta funkcja jak jest async to zwraca promises
wewnatrz funkcji await czeka az wykona sie inna funkja aynchroniczna, ktora tez zwraca promises
ten warunek z awail jest odpiwdnikiem promises.then(callback)
*/
const getDogPic = async (numOfPics) => {
  try {
    const data = await readFilePro('dog.txt');
    const arrOfPromises = [];
    // const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

    for (let i = 1; i <= numOfPics; i++) {
      arrOfPromises.push(superagent.get(`https://dog.ceo/api/breed/${data}/images/random`));
    }

    const all = await Promise.all([...arrOfPromises]);
    const images = all.map((el) => el.body.message);

    writeFilePro('dog-img.txt', images.join('\n'));
    console.log('zapisane');
    // await writeFilePro('dog-img.txt', res.body.message) tak mozemy jesli jescze nizej w tej funkjicjest jakis kod
  } catch (error) {
    // console.log(error);
    // return 'Koniec funkcji ale jest blad';
    throw error;
  }
  return 'Koniec funkcji getDogPic';
};

/*
console.log('1:');
const x = getDogPic();
console.log(x);
x.then((res) => console.log(res));
console.log('2:');
*/

//iife  Immediately-invoked Function Expression
(async () => {
  try {
    const x = await getDogPic(3);
    console.log(x);
  } catch (error) {
    console.log(error);
  }
})();
