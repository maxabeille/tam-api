export const nextTramsToDirection = async (req, res) => {
  const direction = req?.body?.intentInfo?.parameters?.direction?.originalValue;
  if (!direction) {
    return 'Je ne peux pas récupérer la destination.';
  }
  if (!['mosson', 'odysseum'].includes(direction)) {
    return 'Je ne peux pas récupérer les horaires pour cette destination.';
  }

  const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=${direction}`);
  const data = await response.json();
  return `Les prochains trams vers ${direction} arrive dans ${data.map(data => data.duration.min).join(', ')} minutes.`;
} 