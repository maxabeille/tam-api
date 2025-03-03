export const parseTime = (time) => {
  const now = new Date();

  const [hours, minutes, seconds] = time.split(':').map(Number);
  const stopTime = new Date(now);
  stopTime.setHours(hours, minutes, seconds, 0);

  let deltaMs = stopTime - now;
  
  // Si l'heure est passée mais dans une plage de 30 minutes, on considère que le tram est en retard
  if (deltaMs < 0 && Math.abs(deltaMs) < 30 * 60 * 1000) {
      return { min: 0, sec: 0 };
  }

  // Si l'heure est passée et hors plage, c'est l'horaire du lendemain
  if (deltaMs < 0) {
      stopTime.setDate(stopTime.getDate() + 1);
      deltaMs = stopTime - now;
  }

  return {
    min: Math.floor(deltaMs / (1000 * 60)),
    sec: Math.floor((deltaMs % (1000 * 60)) / 1000)
  };
};
