function normalize(value, min, max) {
  return (value - min) / (max - min);
}

function preprocess(entry) {
  return {
    trestbps: normalize(entry.trestbps, 90, 180),
    chol: normalize(entry.chol, 100, 400),
    thalach: normalize(entry.thalach, 70, 210)
  };
}

module.exports = { preprocess };
