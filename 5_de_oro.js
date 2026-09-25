global.fetch = require('node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');

const fileName = 'historial.json';
const history = JSON.parse(fs.readFileSync(fileName).toString());
const lastDate = new Date(history.lastUpdate);
const actualDate = new Date();
const actualDay = actualDate.getUTCDate().toString();
const actualMonth = (actualDate.getUTCMonth() + 1).toString();
const actualYear = actualDate.getUTCFullYear().toString();

function orderNumbers(array) {
  return array
    .map((obj, idx) => ({num: obj.number, idx}))
    .sort((a, b) => (a.idx % 2) - (b.idx % 2))
    .map((obj) => obj.num);
}

async function getData() {
  let nextDate = new Date(lastDate.setDate(lastDate.getDate() + 1));
  let day = nextDate.getUTCDate().toString();
  let month = (nextDate.getUTCMonth() + 1).toString();
  let year = nextDate.getUTCFullYear().toString();
  let dateToAnalice = `${year}-${month}-${day}`;
  let urlToAnalice = `https://loteria.gub.uy/ver_resultados.php?vdia=${day}&vmes=${month}&vano=${year}`;
  let isTotalUpdate =
    day === actualDay && month === actualMonth && year === actualYear;

  while (!isTotalUpdate) {
    console.log('OBTENIENDO... ' + dateToAnalice);
    const res = await fetch(urlToAnalice);
    const text = await res.text();
    const html = new jsdom.JSDOM(text);
    fs.writeFileSync(`./html/${dateToAnalice}`, text);

    // GET DATA 5 DE ORO, QUINELA y TOMBOLA
    const elements = html.window.document.getElementsByClassName('text_azul_3');
    const oro = [];
    const quinelaAndTombola = [];
    for (var i = 0; i < elements.length; i++) {
      const number = Number(elements[i].innerHTML);
      const isOro = elements[i].parentElement.outerHTML.includes(
        'LOTERIAS/2011/circulo_oro',
      );

      if (isOro) {
        oro.push(number);
      } else if (number >= 0) {
        quinelaAndTombola.push({element: elements[i], number});
      }
    }
    const oroFinal = [oro.slice(0, 6), oro.slice(6, 11)];
    const quinelaVespertina = quinelaAndTombola.slice(0, 20);
    const tombolaVespertina = quinelaAndTombola.slice(20, 40);
    const quinelaNocturna = quinelaAndTombola.slice(40, 60);
    const tombolaNocturna = quinelaAndTombola.slice(60, 80);
    // type 0: nada type 1: esta ordenado, type 2: solo hay vespertina, type 3: solo hay nocturna
    const type =
      quinelaAndTombola.length === 0
        ? 0
        : tombolaNocturna.length !== 0
        ? 1
        : quinelaVespertina[0].element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerHTML.includes(
            'VESPERTINA',
          )
        ? 2
        : 3;
    const data = {};

    if (oroFinal[0].length !== 0) data.oro = oroFinal;
    switch (type) {
      case 1:
        data.quinelaVespertina = orderNumbers(quinelaVespertina);
        data.tombolaVespertina = tombolaVespertina.map((obj) => obj.number);
        data.quinelaNocturna = orderNumbers(quinelaNocturna);
        data.tombolaNocturna = tombolaNocturna.map((obj) => obj.number);
        break;
      case 2:
        data.quinelaVespertina = orderNumbers(quinelaVespertina);
        data.tombolaVespertina = tombolaVespertina.map((obj) => obj.number);
        break;
      case 3:
        data.quinelaNocturna = orderNumbers(quinelaVespertina);
        data.tombolaNocturna = tombolaVespertina.map((obj) => obj.number);
        break;
      default:
        break;
    }

    // todo: SET DATA 5 DE ORO QUINELA TOMBOLA
    history[dateToAnalice] = {...data};
    nextDate = new Date(nextDate.setDate(nextDate.getDate() + 1));
    day = nextDate.getUTCDate().toString();
    month = (nextDate.getUTCMonth() + 1).toString();
    year = nextDate.getUTCFullYear().toString();
    dateToAnalice = `${year}-${month}-${day}`;
    urlToAnalice = `https://loteria.gub.uy/ver_resultados.php?vdia=${day}&vmes=${month}&vano=${year}`;
    isTotalUpdate =
      day === actualDay && month === actualMonth && year === actualYear;
    console.log('SETTED: ' + dateToAnalice);
  }

  history.lastUpdate = dateToAnalice;
  fs.writeFileSync(fileName, JSON.stringify(history));
  console.log('TERMINO', history);
}

getData();
