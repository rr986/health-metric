function trainLogisticRegression(dataset) {
  const weights = { trestbps: 0, chol: 0, thalach: 0 };
  let bias = 0;
  const learningRate = 0.1;
  const epochs = 100;

  for (let i = 0; i < epochs; i++) {
    for (const entry of dataset) {
      const { trestbps, chol, thalach } = entry.data;
      const x = [trestbps, chol, thalach];
      const y = parseFloat(entry.label);
      const z = weights.trestbps * x[0] + weights.chol * x[1] + weights.thalach * x[2] + bias;
      const pred = 1 / (1 + Math.exp(-z));
      const error = pred - y;
      weights.trestbps -= learningRate * error * x[0];
      weights.chol -= learningRate * error * x[1];
      weights.thalach -= learningRate * error * x[2];
      bias -= learningRate * error;
    }
  }

  return { weights, bias };
}

function predictLogisticRegression(model, input) {
  const z =
    model.weights.trestbps * input.trestbps +
    model.weights.chol * input.chol +
    model.weights.thalach * input.thalach +
    model.bias;
  const pred = 1 / (1 + Math.exp(-z));
  return pred >= 0.5 ? '1' : '0';
}

module.exports = { trainLogisticRegression, predictLogisticRegression };
