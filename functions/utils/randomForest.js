function trainRandomForest(dataset) {
  // Create simple mock rules based on thresholds
  const rules = [];

  // Basic rule: if trestbps > 0.6 → label = 1, else label = 0
  rules.push({
    feature: 'trestbps',
    threshold: 0.6,
    labelIfAbove: '1',
    labelIfBelow: '0',
  });

  rules.push({
    feature: 'chol',
    threshold: 0.5,
    labelIfAbove: '1',
    labelIfBelow: '0',
  });

  rules.push({
    feature: 'thalach',
    threshold: 0.7,
    labelIfAbove: '0',
    labelIfBelow: '1',
  });

  return { rules };
}

function predictRandomForest(model, input) {
  let votes = { '0': 0, '1': 0 };

  for (const rule of model.rules) {
    const featureValue = input[rule.feature];
    const vote = featureValue >= rule.threshold ? rule.labelIfAbove : rule.labelIfBelow;
    votes[vote]++;
  }

  return votes['1'] >= votes['0'] ? '1' : '0';
}

module.exports = { trainRandomForest, predictRandomForest };
