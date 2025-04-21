function trainDecisionTree(dataset) {
  const thresholds = { trestbps: 0.5, chol: 0.5, thalach: 0.5 };
  return { thresholds };
}

function predictDecisionTree(model, input) {

  // Simple rule: count how many features exceed threshold
  let score = 0;
  for (const key in model.thresholds) {
    if (input[key] >= model.thresholds[key]) score++;
  }
  return score >= 2 ? '1' : '0';
}

module.exports = { trainDecisionTree, predictDecisionTree };