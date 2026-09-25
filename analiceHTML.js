const fs = require('fs');
const jsdom = require('jsdom');

const text = JSON.parse(fs.readFileSync('2007-1-7').toString());
const html = new jsdom.JSDOM(text);

const elements = html.window.document.getElementsByClassName('text_azul_3');
const oro = [];
const quinelaAndTombola = [];
for (var i = 0; i < elements.length; i++) {
  const number = Number(elements[i].innerHTML);
  const isOro = elements[i].parentElement.outerHTML.includes(
    'LOTERIAS/2011/circulo_oro',
  );

  console.log(elements[i].innerHTML);
  if (isOro) {
    oro.push(number);
  } else if (number >= 0) {
    quinelaAndTombola.push({element: elements[i], number});
  }
}
console.log(oro);
const oroFinal = [oro.slice(0, 6), oro.slice(6, 11)];
const quinelaVespertina = quinelaAndTombola.slice(0, 20);
const tombolaVespertina = quinelaAndTombola.slice(20, 40);
const quinelaNocturna = quinelaAndTombola.slice(40, 60);
const tombolaNocturna = quinelaAndTombola.slice(60, 80);
// type 0: nada type 1: esta ordenado, type 2: solo hay vespertina, type 3: solo hay nocturna
const type =
  quinelaAndTombola.length === 0
    ? 0
    : tombolaNocturna.length > 0
    ? 1
    : quinelaVespertina[0].element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerHTML.find('VESPERTINA')
    ? 2
    : 3;
const data = {};

if (oroFinal[0].length !== 0) data.oro = oroFinal;
switch (type) {
  case 1:
    data.quinelaVespertina = quinelaVespertina.map((obj) => obj.number);
    data.tombolaVespertina = tombolaVespertina.map((obj) => obj.number);
    data.quinelaNocturna = quinelaNocturna.map((obj) => obj.number);
    data.tombolaNocturna = tombolaNocturna.map((obj) => obj.number);
    break;
  case 2:
    data.quinelaVespertina = quinelaVespertina.map((obj) => obj.number);
    data.tombolaVespertina = tombolaVespertina.map((obj) => obj.number);
    break;
  case 3:
    data.quinelaNocturna = quinelaVespertina.map((obj) => obj.number);
    data.tombolaNocturna = tombolaVespertina.map((obj) => obj.number);
    break;
  default:
    break;
}
