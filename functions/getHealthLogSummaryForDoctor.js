const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { decrypt } = require('./utils/encryption');

const db = admin.firestore();

exports.getHealthLogSummaryForDoctor = functions.https.onCall(async (data, context) => {
  try {
    console.log('[DoctorSummary] Raw Data:', data);

    const { patientId } = data.data || {};

    console.log('[DoctorSummary] patientId:', patientId);

    if (!patientId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing patient ID.');
    }

    const ref = db.collection('users')
      .doc(patientId)
      .collection('secureHealthEntries')
      .orderBy('createdAt', 'desc')
      .limit(10);

    console.log('[DoctorSummary] Querying Firestore:', ref.path);

    const snapshot = await ref.get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'No health data found.');
    }

    const logs = [];

    snapshot.forEach(doc => {
      const entry = doc.data();
      console.log('[DoctorSummary] Decrypting entry:', entry);
      const decrypted = JSON.parse(decrypt(entry.encrypted, entry.iv));
      logs.push({
        ...decrypted,
        createdAt: entry.createdAt?.toDate().toISOString() || null
      });
    });

    console.log('[DoctorSummary] Logs prepared:', logs);

    return {
      logs,
      summary: `${logs.length} entries returned.`,
    };
  } catch (err) {
    console.error('[DoctorSummary ERROR]', err);
    throw new functions.https.HttpsError('internal', err.message || 'Unknown error occurred.');
  }
});

