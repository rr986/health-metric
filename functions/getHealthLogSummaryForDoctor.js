const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { decrypt } = require('./utils/encryption');

const db = admin.firestore();

exports.getHealthLogSummaryForDoctor = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { patientId } = data;

  if (!patientId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing patient ID.');
  }

  const snapshot = await db.collection('secureHealthEntries')
    .where('userId', '==', patientId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  const logs = [];

  snapshot.forEach(doc => {
    const entry = doc.data();
    const decrypted = JSON.parse(decrypt(entry.encrypted, entry.iv));
    logs.push({
      ...decrypted,
      createdAt: entry.createdAt?.toDate() || null
    });
  });

  return {
    logs,
    summary: `${logs.length} entries returned.`,
  };
});
