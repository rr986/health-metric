const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { decrypt } = require('./utils/encryption');

const db = admin.firestore();

const warningInteractions = {
  betaBlocker: {
    maxHR: 90
  },
  statin: {
    maxChol: 240
  },
  diuretic: {
    maxBP: 140
  }
};

exports.analyzeMedication = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { prescriptions } = data;
  if (!Array.isArray(prescriptions)) {
    throw new functions.https.HttpsError('invalid-argument', 'Prescriptions must be an array.');
  }

  // Get latest entry
  const snapshot = await db.collection('secureHealthEntries')
    .where('userId', '==', context.auth.uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'No vitals found.');
  }

  const doc = snapshot.docs[0].data();
  const decrypted = JSON.parse(decrypt(doc.encrypted, doc.iv));

  const issues = [];

  for (const med of prescriptions) {
    const normMed = med.toLowerCase();
    const limits = warningInteractions[normMed];
    if (!limits) continue;

    if (limits.maxHR && decrypted.thalach > limits.maxHR) {
      issues.push(`${med} may interact with high heart rate (${decrypted.thalach})`);
    }
    if (limits.maxChol && decrypted.chol > limits.maxChol) {
      issues.push(`${med} may be less effective with high cholesterol (${decrypted.chol})`);
    }
    if (limits.maxBP && decrypted.trestbps > limits.maxBP) {
      issues.push(`${med} may require blood pressure control (${decrypted.trestbps})`);
    }
  }

  return {
    issues,
    message: issues.length
      ? "Some medication interactions were flagged."
      : "No obvious interactions found."
  };
});
