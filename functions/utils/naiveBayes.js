function trainNaiveBayes(dataset) {
  const labelCounts = {};
  const featureSums = {};
  const featureCounts = {};

  for (const entry of dataset) {
    const label = entry.label;
    labelCounts[label] = (labelCounts[label] || 0) + 1;

    for (const [key, value] of Object.entries(entry.data)) {
      featureSums[label] = featureSums[label] || {};
      featureCounts[label] = featureCounts[label] || {};
      featureSums[label][key] = (featureSums[label][key] || 0) + value;
      featureCounts[label][key] = (featureCounts[label][key] || 0) + 1;
    }
  }

  const model = {};
  for (const label in labelCounts) {
    model[label] = {};
    for (const feature in featureSums[label]) {
      model[label][feature] = featureSums[label][feature] / featureCounts[label][feature];
    }
  }

  return { model, labelCounts };
}

function predictNaiveBayes(model, labelCounts, input) {
  let bestLabel = null;
  let bestScore = -Infinity;

  for (const label in model) {
    let score = Math.log(labelCounts[label] || 1);
    for (const feature in input) {
      const mean = model[label][feature];
      const value = input[feature];
      const diff = value - mean;
      score -= diff * diff; // basic Gaussian-like assumption
    }
    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }
  }

  return bestLabel;
}

module.exports = { trainNaiveBayes, predictNaiveBayes };
