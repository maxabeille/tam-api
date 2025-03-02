export const nextTramsToDirection = async (req, res) => {
  const direction = req?.body?.intentInfo?.parameters?.direction[0]?.originalValue;
  if (!direction) {
    return 'Je ne peux pas récupérer la destination.';
  }
  if (!['mosson', 'odysseum'].includes(direction)) {
    return 'Je ne peux pas récupérer les horaires pour cette destination.';
  }

  const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=${direction}`);
  const data = await response.json();
  const nextTram = data[0].duration.min;
  return `Le prochain tram vers ${direction} arrive dans ${nextTram} minutes.`
} 