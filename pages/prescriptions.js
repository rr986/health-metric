import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../utils/firebase';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeMeds = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const analyze = httpsCallable(functions, 'analyzeMedication');
      const res = await analyze({
        uid,
        prescriptions: prescriptions.split(',').map((m) => m.trim())
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Medication Interaction Checker</h2>
      <input
        type="text"
        placeholder="Enter prescriptions (comma-separated)"
        value={prescriptions}
        onChange={(e) => setPrescriptions(e.target.value)}
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button onClick={analyzeMeds} style={{ marginTop: '1rem' }}>Analyze</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
