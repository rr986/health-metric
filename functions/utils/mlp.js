function trainMLP(dataset) {
  // Mock training: return static weights and biases
  return {
    weights: {
      layer1: {
        trestbps: 0.3,
        chol: 0.2,
        thalach: 0.5
      },
      bias1: 0.1,
      output: {
        node: [0.6, -0.4, 0.3],  // weights for a single output node
        bias: 0.2
      }
    }
  };
}

function predictMLP(model, input) {
  const { trestbps, chol, thalach } = input;
  const l1 = [
    Math.max(0, model.weights.layer1.trestbps * trestbps + model.weights.bias1),
    Math.max(0, model.weights.layer1.chol * chol + model.weights.bias1),
    Math.max(0, model.weights.layer1.thalach * thalach + model.weights.bias1)
  ];
  const z = l1[0] * model.weights.output.node[0] + l1[1] * model.weights.output.node[1] + l1[2] * model.weights.output.node[2] + model.weights.output.bias;
  const pred = 1 / (1 + Math.exp(-z));
  return pred >= 0.5 ? '1' : '0';
}

module.exports = { trainMLP, predictMLP };
