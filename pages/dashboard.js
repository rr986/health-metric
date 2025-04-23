import React, { useEffect, useState } from 'react';
import { auth, functions } from '../utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [risk, setRisk] = useState(null);
  const [vitalStoreResult, setVitalStoreResult] = useState(null);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('naiveBayes');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleStoreVitals = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = {
        uid,
        trestbps: 135,
        chol: 220,
        thalach: 95,
        glucose: 110,
      };

      const storeFn = httpsCallable(functions, 'secureStoreHealthData');
      const res = await storeFn(payload);
      setVitalStoreResult(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRiskPrediction = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const predictFn = httpsCallable(functions, 'predictRisk');
      const res = await predictFn({ uid, method });
      setRisk(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      window.location.reload();
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Health Risk Dashboard</h1>

      {user && <p><strong>Signed in as:</strong> {user.email}</p>}

      {user && (
        <button onClick={handleSignOut} style={{ marginBottom: '1rem' }}>
          Sign Out
        </button>
      )}

      <button onClick={handleStoreVitals} style={{ marginTop: '1rem' }}>
        Store Sample Health Data
      </button>

      <div style={{ marginTop: '1rem' }}>
        <label><strong>Select ML Algorithm:</strong></label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.3rem' }}
        >
          <option value="naiveBayes">Naive Bayes</option>
          <option value="logisticRegression">Logistic Regression</option>
          <option value="mlp">MLP (Neural Network)</option>
          <option value="randomForest">Random Forest</option>
        </select>
      </div>

      <button onClick={handleRiskPrediction} style={{ marginTop: '1rem' }}>
        Predict Risk
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {vitalStoreResult && (
        <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
          <strong>Health Data Stored:</strong>
          <pre>{JSON.stringify(vitalStoreResult, null, 2)}</pre>
        </div>
      )}

      {risk && (
        <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>
          <strong>Predicted Risk ({method}):</strong>
          <pre>{JSON.stringify(risk, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


/* last import React, { useEffect, useState } from 'react';
import { auth, functions } from '../utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [risk, setRisk] = useState(null);
  const [vitalStoreResult, setVitalStoreResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleStoreVitals = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = {
        uid,
        trestbps: 135,
        chol: 220,
        thalach: 95,
        glucose: 110,
      };

      const storeFn = httpsCallable(functions, 'secureStoreHealthData');
      const res = await storeFn(payload);
      setVitalStoreResult(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRiskPrediction = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const predictFn = httpsCallable(functions, 'predictRisk');
      const res = await predictFn({ uid });
      setRisk(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      window.location.reload();
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Your Dashboard</h1>

      {user && (
        <p>
          <strong>Status:</strong> Signed in as {user.email}
        </p>
      )}

      {user && (
        <button onClick={handleSignOut} style={{ marginBottom: '1rem' }}>
          Sign Out
        </button>
      )}

      <button onClick={handleStoreVitals} style={{ marginTop: '1rem' }}>
        Store Example Health Data
      </button>

      <button onClick={handleRiskPrediction} style={{ marginTop: '1rem' }}>
        Predict Health Risk
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {vitalStoreResult && (
        <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
          <strong>Health Data Stored:</strong>
          <pre>{JSON.stringify(vitalStoreResult, null, 2)}</pre>
        </div>
      )}

      {risk && (
        <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>
          <strong>Predicted Risk:</strong>
          <pre>{JSON.stringify(risk, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


import React, { useEffect, useState } from 'react';
import { auth, functions } from '../utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [healthLogs, setHealthLogs] = useState(null);
  const [medIssues, setMedIssues] = useState(null);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('[AUTH] User:', firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken(true);
          console.log('[AUTH] ID Token:', idToken);
          setToken(idToken);
        } catch (e) {
          console.error('Failed to get ID token:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStore = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = {
        uid,
        trestbps: 135,
        chol: 220,
        thalach: 95,
        glucose: 110,
      };

      console.log('[STORE PAYLOAD]', payload);

      const secureStore = httpsCallable(functions, 'secureStoreHealthData');
      const res = await secureStore(payload);

      console.log('[STORE RESULT]', res.data);
      setResult(res.data);
      setError(null);
    } catch (err) {
      console.error('[STORE ERROR]', err);
      setError(err.message);
    }
  };

  const handlePredict = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = { uid };
      console.log('[PREDICT PAYLOAD]', payload);

      const predictFn = httpsCallable(functions, 'predictRisk');
      const res = await predictFn(payload);

      console.log('Predict result:', res.data);
      setResult(res.data);
      setError(null);
    } catch (err) {
      console.error('[PREDICT ERROR]', err);
      setError(err.message);
    }
  };

  const handleCoach = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = { uid };
      console.log('[COACH PAYLOAD]', payload);

      const coachFn = httpsCallable(functions, 'healthCoachSuggestions');
      const res = await coachFn(payload);

      console.log('Coach result:', res.data);
      setPrediction(res.data);
      setError(null);
    } catch (err) {
      console.error('[COACH ERROR]', err);
      setError(err.message);
    }
  };

  const handleGetLogs = async () => {
    try {
      if (!patientId) throw new Error('Patient ID required');

      const getLogs = httpsCallable(functions, 'getHealthLogSummaryForDoctor');

      const res = await getLogs({ patientId });

      console.log('[LOGS RESULT]', res.data);
      setHealthLogs(res.data);
      setError(null);
    } catch (err) {
      console.error('[LOGS ERROR]', err);
      setError(err.message);
    }
  };

  const handleAnalyzeMeds = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not signed in.');

      const payload = {
        uid,
        prescriptions: ['statin', 'betaBlocker', 'diuretic'],
      };

      console.log('[MEDICATION PAYLOAD]', payload);

      const analyze = httpsCallable(functions, 'analyzeMedication');
      const res = await analyze(payload);

      console.log('Medication Analysis:', res.data);
      setMedIssues(res.data);
      setError(null);
    } catch (err) {
      console.error('[MEDICATION ERROR]', err);
      setError(err.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('Signed out successfully');
      window.location.reload();
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Test Dashboard</h1>
      <p>
        <strong>Status:</strong>{' '}
        {user ? `Signed in as ${user.email}` : 'Not signed in'}
      </p>

      {user && (
        <button onClick={handleSignOut} style={{ marginBottom: '1rem' }}>
          Sign Out
        </button>
      )}

      <button onClick={handleStore} style={{ marginTop: '1rem' }}>
        Store Health Data (secureStoreHealthData)
      </button>

      <button onClick={handlePredict} style={{ marginTop: '1rem' }}>
        Predict Risk (predictRisk)
      </button>

      <button onClick={handleCoach} style={{ marginTop: '1rem' }}>
        Get Health Coach Suggestions (healthCoachSuggestions)
      </button>

      <button onClick={handleAnalyzeMeds} style={{ marginTop: '1rem' }}>
        Analyze Medications (analyzeMedication)
      </button>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter Patient ID"
        />
        <button onClick={handleGetLogs}>
          Get Logs for Doctor (getHealthLogSummaryForDoctor)
        </button>
      </div>

      {token && (
        <div style={{ marginTop: '1rem', wordBreak: 'break-word' }}>
          <strong>Token:</strong>
          <pre style={{ background: '#eee', padding: '1rem' }}>{token}</pre>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem' }}>
          <strong>Store/Prediction Result:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {prediction && (
        <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem' }}>
          <strong>Health Coach Suggestions:</strong>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}

      {medIssues && (
        <div style={{ marginTop: '1rem', background: '#fff3e0', padding: '1rem' }}>
          <strong>Medication Issues:</strong>
          <pre>{JSON.stringify(medIssues, null, 2)}</pre>
        </div>
      )}

      {healthLogs && (
        <div style={{ marginTop: '1rem', background: '#e8f5e9', padding: '1rem' }}>
          <strong>Patient Health Logs:</strong>
          <pre>{JSON.stringify(healthLogs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
*/