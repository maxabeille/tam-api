export const nextTrams = async (req, res) => {
  const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=mosson`);
  const data = await response.json();
  return `Les prochains trams vers Mosson arrive dans ${data.map(data => data.duration.min).join(', ')} minutes.`;
} 