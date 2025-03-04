import { writeFileSync } from 'fs';
import lineMappingsOld from "../data/lineMappings_old.json" with { type: "json" };

fetch('https://cartographie.tam-voyages.com/gtfs/lignes').then(response => {
  return response.json()
}).then(res => {
  const linesMap = res.map(line => (
    { 
      ...line, 
      imgUrl: lineMappingsOld.find(x => x.number === line.id)?.imgUrl,
      direction: {
        1: line.ligne_param.nom_aller,
        2: line.ligne_param.nom_retour
      }
    }
  ))

  writeFileSync('./src/data/lineMappings.json', JSON.stringify(linesMap, null, 2));
})