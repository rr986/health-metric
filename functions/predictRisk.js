const functions = require('firebase-functions');
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
          label: row.target
        });
      })
      .on('end', () => resolve(dataset))
      .on('error', reject);
  });
}

exports.predictRisk = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const uid = context.auth.uid;

  //Get encrypted vitals from Firestore
  const snapshot = await db.collection('secureHealthEntries')
    .where('userId', '==', uid)
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
    thalach: decryptedData.thalach
  });

  //Load dataset and train model
  const dataset = await loadHeartDataset();
  const { model, labelCounts } = trainNaiveBayes(dataset);

  //Predict risk
  const result = predictNaiveBayes(model, labelCounts, input);

  return { risk: result };
});
