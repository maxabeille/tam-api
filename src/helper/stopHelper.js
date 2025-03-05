const isLeaf = (data) => {
  return Object.values(data).every(x => ['string', 'number', 'boolean'].includes(typeof x))
}

export const deepToArray = (data) => {
  if (Array.isArray(data)) {
    return data.map(deepToArray);
  } else if (data !== null && typeof data === "object" && !isLeaf(data)) {
    return deepToArray(Object.values(data));
  } else {
    return data;
  }
};

export const flattenStops = (data) => deepToArray(data).flat(Infinity);
