const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { encrypt } = require('./utils/encryption');

const db = admin.firestore();

exports.secureStoreHealthData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  }

  const { trestbps, chol, thalach, glucose } = data;

  if (!trestbps || !chol || !thalach) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required vital signs.');
  }

  const { encrypted, iv } = encrypt({ trestbps, chol, thalach, glucose });

  await db.collection('secureHealthEntries').add({
    userId: context.auth.uid,
    encrypted,
    iv,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});
