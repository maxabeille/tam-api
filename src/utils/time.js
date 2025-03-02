export const parseTime = (time) => {
    const now = new Date();

    const [hours, minutes, seconds] = time.split(':').map(Number);
    const stopTime = new Date(now);
    stopTime.setHours(hours, minutes, seconds, 0);

    if (stopTime < now) {
      stopTime.setDate(stopTime.getDate() + 1);
    }
    const deltaMs = stopTime - now;
    const deltaMinutes = Math.floor(deltaMs / (1000 * 60));
    const deltaSeconds = Math.floor((deltaMs % (1000 * 60)) / 1000);
    return {
      min: deltaMinutes,
      sec: deltaSeconds
    }
}