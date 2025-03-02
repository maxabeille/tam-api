export const nextTramsToDirection = async (req, res) => {
  const destination = req?.body?.fulfillmentInfo?.parameters?.destination;
  if (!destination) {
    return 'Je ne peux pas récupérer la destination.';
  }
  if (!['mosson', 'odysseum'].includes(destination)) {
    return 'Je ne peux pas récupérer les horaires pour cette destination.';
  }

  const response = await fetch(`https://tam.alexis-mateo.fr/stop/next/${encodeURIComponent('pl. de l\'europe')}?line=1&destination=${destination}`);
  const data = await response.json();
  const nextTram = data[0].duration.min;
  return `Le prochain tram vers ${destination} arrive dans ${nextTram} minutes.`
} 