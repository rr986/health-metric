const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { decrypt } = require('./utils/encryption');
const { preprocess } = require('./utils/preprocessing');
const { trainNaiveBayes, predictNaiveBayes } = require('./utils/naiveBayes');
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
            thalach: parseFloat(row.thalach)
          }),
          label: row.target
        });
      })
      .on('end', () => resolve(dataset))
      .on('error', reject);
  });
}

exports.healthCoachSuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const uid = context.auth.uid;

  const snapshot = await db.collection('secureHealthEntries')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'No health data found.');
  }

  const doc = snapshot.docs[0].data();
  const vitals = JSON.parse(decrypt(doc.encrypted, doc.iv));

  const dataset = await loadHeartDataset();
  const { model, labelCounts } = trainNaiveBayes(dataset);

  const input = preprocess(vitals);
  const baselineRisk = predictNaiveBayes(model, labelCounts, input);

  // Try improving each metric one-by-one
  const suggestions = [];
  const testVariants = [
    {
      field: 'trestbps',
      newValue: Math.max(vitals.trestbps - 20, 90),
      label: 'Lower your blood pressure'
    },
    {
      field: 'chol',
      newValue: Math.max(vitals.chol - 40, 100),
      label: 'Reduce your cholesterol intake'
    },
    {
      field: 'thalach',
      newValue: Math.min(vitals.thalach + 15, 210),
      label: 'Improve your heart rate with cardio'
    }
  ];

  for (const variant of testVariants) {
    const trialInput = { ...vitals, [variant.field]: variant.newValue };
    const processed = preprocess(trialInput);
    const simulatedRisk = predictNaiveBayes(model, labelCounts, processed);

    if (simulatedRisk < baselineRisk) {
      suggestions.push({
        recommendation: variant.label,
        estimatedImpact: `Risk may drop from ${baselineRisk} → ${simulatedRisk}`
      });
    }
  }

  return {
    baselineRisk,
    suggestions,
    message: suggestions.length
      ? "Here are some changes that may lower your health risk:"
      : "No major improvements detected from individual changes."
  };
});
