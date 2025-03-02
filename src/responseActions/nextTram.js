export const nextTram = async (req, res) => {
  const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=mosson`);
  const data = await response.json();
  const nextTram = data[0].duration.min;
  return `Le prochain tram vers Mosson arrive dans ${nextTram} minutes.`
} 