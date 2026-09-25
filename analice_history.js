const fs = require('fs');
const history = JSON.parse(fs.readFileSync('historial.JSON'));
const miJugada = [8, 13, 29, 45];
const numerosSalidos = {};

function getNumberOfTimes(array) {
  const to10 = array.find((num) => num < 10);
  const to20 = array.find((num) => num > 9 && num < 20);
  const to30 = array.find((num) => num > 19 && num < 30);
  const to40 = array.find((num) => num > 29 && num < 40);
  const to48 = array.find((num) => num > 39 && num < 49);
  const number = [to10, to20, to30, to40, to48].reduce(
    (acc, curr) => (!curr ? acc + 1 : acc),
    0,
  );
  return number;
}

function pushNumber(number) {
  switch (number) {
    case 0:
      return (oneOfTen += 1);
    case 1:
      return (twoOfTen += 1);
    case 2:
      return (threeOfTen += 1);
    case 3:
      return (fourOfTen += 1);
    case 4:
      return (fiveOfTen += 1);
  }
}

let oneOfTen = 0;
let twoOfTen = 0;
let threeOfTen = 0;
let fourOfTen = 0;
let fiveOfTen = 0;
let totalJugadas = 0;
let dateFirst44to48 = new Date('2014-3-19');

const keys = Object.keys(history);

keys
  // .reverse()
  .forEach((key) => {
    if (dateFirst44to48 >= new Date(key)) return; // contar las jugadas a partir de la introduccion del 44 al 48
    // Ver si salio mi jugada
    const [orito, revancha] = history[key].oro || [[], []];
    const saqueOro = miJugada.every((num) => orito.includes(num));
    const saqueRevancha = miJugada.every((num) => revancha.includes(num));
    if (saqueOro || saqueRevancha) {
      console.log({saqueOro, saqueRevancha, dia: key});
    }

    // ver si salio un numero de cada 10 en cada jugada
    if (orito.length > 0) {
      const number = getNumberOfTimes(orito.slice(0, 5)); // sin contar la bolilla extra
      // const number = getNumberOfTimes(orito); // contando la bolilla extra
      pushNumber(number);
      totalJugadas += 1;
    }

    if (revancha.length > 0) {
      const number = getNumberOfTimes(revancha);
      pushNumber(number);
      totalJugadas += 1;
    }

    // contabilizando numero salidos
    orito.forEach((num) =>
      numerosSalidos[num]
        ? (numerosSalidos[num] += 1)
        : (numerosSalidos[num] = 1),
    );

    revancha.forEach((num) =>
      numerosSalidos[num]
        ? (numerosSalidos[num] += 1)
        : (numerosSalidos[num] = 1),
    );

    //   history[key].oro;
    //   history[key].quinelaVespertina;
    //   history[key].tombolaVespertina;
    //   history[key].quinelaNocturna;
    //   history[key].tombolaNocturna;
  });

const ordenados = Object.keys(numerosSalidos)
  .map((key) => [numerosSalidos[key], key])
  .sort((a, b) => a[0] - b[0]);

// ordenados.forEach((obj) =>
//   console.log(`El numero ${obj[1]} salió ${obj[0]} veces`),
// );

const percentOne = (oneOfTen * 100) / totalJugadas;
const percentTwo = (twoOfTen * 100) / totalJugadas;
const percentThree = (threeOfTen * 100) / totalJugadas;
const percentFour = (fourOfTen * 100) / totalJugadas;
const percentFive = (fiveOfTen * 100) / totalJugadas;

console.log(`Total de jugadas analizadas ${totalJugadas} (2 por sorteo)`);
console.log(
  `El numero que mas salio es el ${ordenados[ordenados.length - 1][1]}, ${
    ordenados[ordenados.length - 1][0]
  } veces`,
);

console.log({percentOne, percentTwo, percentThree, percentFour, percentFive});
console.log({dateFirst44to48});
