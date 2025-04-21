const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { encrypt } = require('./utils/encryption');

const db = admin.firestore();

exports.secureStoreHealthData = functions.https.onCall(async (data, context) => {
  const { uid, trestbps, chol, thalach, glucose } = data.data;

  console.log('[secureStoreHealthData] UID:', uid);
  console.log('[secureStoreHealthData] Data:', { trestbps, chol, thalach, glucose });

  if (!uid || !trestbps || !chol || !thalach) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required vital signs or UID.');
  }

  const { encrypted, iv } = encrypt({ trestbps, chol, thalach, glucose });

  await db
    .collection('users')
    .doc(uid)
    .collection('secureHealthEntries')
    .add({
      encrypted,
      iv,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return { success: true };
});
