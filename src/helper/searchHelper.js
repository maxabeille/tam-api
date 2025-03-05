export const getResearch = async (query) => {
  const baseURL = `https://cartographie.tam-voyages.com/api/itinerary/autocomplete?q=${encodeURIComponent(query)}`
  return (await (await fetch(baseURL)).json()).Data
}
