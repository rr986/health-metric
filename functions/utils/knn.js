function trainKNN(dataset) {
  return dataset;
}

function predictKNN(model, input, k = 3) {
  const distances = model.map(entry => {
    const dist = Math.sqrt(
      Object.keys(input).reduce((sum, key) => sum + Math.pow(entry.data[key] - input[key], 2), 0)
    );
    return { label: entry.label, dist };
  });

  distances.sort((a, b) => a.dist - b.dist);
  const topK = distances.slice(0, k);
  const counts = topK.reduce((acc, { label }) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

module.exports = { trainKNN, predictKNN };
