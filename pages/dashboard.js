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