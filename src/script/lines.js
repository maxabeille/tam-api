import { parse } from 'node-html-parser';
import { writeFileSync } from 'fs';


fetch('https://www.tam-voyages.com/horaires_ligne/index.asp?rub_code=6&laction=modifySearch&actionButton=SearchByLineNumberHiddenField').then(response => {
  return response.text()
}).then(text => {
  const root = parse(text)
  const lines = root.querySelectorAll('.lignes > ul li')
  let linesMap = lines.map(x => {

    const link = x.querySelector('a')
    const img = x.querySelector('img')

    return {
      imgUrl: 'https://www.tam-voyages.com' + img.getAttribute('src'),
      name: link.text.replace('direction ', ''),
      type: img.getAttribute('src').includes('TRAM') ? 'tram' : 'bus',
      id: +link.getAttribute('href').match(/lign_id=\d{1,2}/g)[0].split('=')[1],
      number: +img.getAttribute('alt'),
      sens: +link.getAttribute('href').match(/sens=\d/g)[0].split(' ')[0].split('=')[1]
    }
  })

  writeFileSync('./src/data/lineMappings.json', JSON.stringify(linesMap, null, 2));
})