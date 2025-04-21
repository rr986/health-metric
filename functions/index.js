const admin = require('firebase-admin');
admin.initializeApp();
const functions = require('firebase-functions');

const { predictRisk } = require('./predictRisk');
const { secureStoreHealthData } = require('./secureStoreHealthData');
const { analyzeMedication } = require('./analyzeMedication');
const { healthCoachSuggestions } = require('./healthCoach');
const { getHealthLogSummaryForDoctor } = require('./getHealthLogSummaryForDoctor');

exports.predictRisk = predictRisk;
exports.secureStoreHealthData = secureStoreHealthData;
exports.analyzeMedication = analyzeMedication;
exports.healthCoachSuggestions = healthCoachSuggestions;
exports.getHealthLogSummaryForDoctor = getHealthLogSummaryForDoctor;

exports.helloWorld = functions.https.onCall((data, context) => {
  console.log('[helloWorld] context.auth:', context.auth);
  return { message: `Hello ${context.auth?.uid || 'Guest'}` };
});

