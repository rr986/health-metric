const functions = require('firebase-functions');
const { preprocess } = require('./utils/preprocessing');
const { trainNaiveBayes, predictNaiveBayes } = require('./utils/naiveBayes');
const { trainDecisionTree, predictDecisionTree } = require('./utils/decisionTree');
const { trainKNN, predictKNN } = require('./utils/knn');
const { trainLogisticRegression, predictLogisticRegression } = require('./utils/logisticRegression');
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
  console.log('[predictRisk] Raw Data:', data);

  const { uid, method = 'naiveBayes' } = data.data || {};
  console.log(`[predictRisk] UID: ${uid}, Method: ${method}`);

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

    case 'decisionTree':
      const tree = trainDecisionTree(dataset);
      risk = predictDecisionTree(tree, input);
      break;

    case 'knn':
      const knnModel = trainKNN(dataset, 3);
      risk = predictKNN(knnModel, input);
      break;

    case 'logisticRegression':
      const lrModel = trainLogisticRegression(dataset, 1000, 0.1);
      risk = predictLogisticRegression(lrModel, input);
      break;

    default:
      throw new functions.https.HttpsError('invalid-argument', `Unknown method: ${method}`);
  }

  return { risk };
});

/*const functions = require('firebase-functions');
const { preprocess } = require('./utils/preprocessing');
const { trainNaiveBayes, predictNaiveBayes } = require('./utils/naiveBayes');
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
  console.log('[predictRisk] Raw Data:', data);

  const { uid } = data.data || {};
  console.log('[predictRisk] UID:', uid);

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
  const { model, labelCounts } = trainNaiveBayes(dataset);

  const result = predictNaiveBayes(model, labelCounts, input);

  return { risk: result };
});
*/
