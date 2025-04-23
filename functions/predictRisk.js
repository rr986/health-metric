const functions = require('firebase-functions');
const { preprocess } = require('./utils/preprocessing');
const { trainNaiveBayes, predictNaiveBayes } = require('./utils/naiveBayes');
const { trainLogisticRegression, predictLogisticRegression } = require('./utils/logisticRegression');
const { trainMLP, predictMLP } = require('./utils/mlp');
const { trainRandomForest, predictRandomForest } = require('./utils/randomForest');
const { decrypt } = require('./utils/encryption');
const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const db = admin.firestore();

async function loadHeartDataset() {
  const filePath = path.join(__dirname, 'data', 'heart.csv');
  const dataset = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        dataset.push({
          data: preprocess({
            trestbps: parseFloat(row.trestbps),
            chol: parseFloat(row.chol),
            thalach: parseFloat(row.thalach),
          }),
          label: row.target,
        });
      })
      .on('end', () => resolve(dataset))
      .on('error', reject);
  });
}

exports.predictRisk = functions.https.onCall(async (data, context) => {
  const { uid, method = 'naiveBayes' } = data.data || {};
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing UID.');
  }

  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('secureHealthEntries')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'No health data found.');
  }

  const doc = snapshot.docs[0].data();
  const decryptedData = JSON.parse(decrypt(doc.encrypted, doc.iv));

  const input = preprocess({
    trestbps: decryptedData.trestbps,
    chol: decryptedData.chol,
    thalach: decryptedData.thalach,
  });

  const dataset = await loadHeartDataset();
  let risk;

  switch (method) {
    case 'naiveBayes':
      const { model: nbModel, labelCounts } = trainNaiveBayes(dataset);
      risk = predictNaiveBayes(nbModel, labelCounts, input);
      break;

    case 'logisticRegression':
      const lrModel = trainLogisticRegression(dataset);
      risk = predictLogisticRegression(lrModel, input);
      break;

    case 'mlp':
      const mlpModel = trainMLP(dataset);
      risk = predictMLP(mlpModel, input);
      break;

    case 'randomForest':
      const forestModel = trainRandomForest(dataset);
      risk = predictRandomForest(forestModel, input);
      break;

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown method: ${method}`);
  }

  return { risk };
});