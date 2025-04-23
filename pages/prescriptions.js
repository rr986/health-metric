import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../utils/firebase';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMeds = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analyze = httpsCallable(functions, 'analyzeMedication');
      const res = await analyze({
        uid,
        prescriptions: prescriptions.split(',').map((m) => m.trim())
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Failed to analyze prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Medication Interaction Checker</h2>
      <p>Enter a list of prescription names, separated by commas.</p>

      <input
        type="text"
        placeholder="e.g. aspirin, advil"
        value={prescriptions}
        onChange={(e) => setPrescriptions(e.target.value)}
        style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem' }}
      />

      <button onClick={analyzeMeds} disabled={loading} style={{ padding: '0.6rem 1.2rem' }}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '2rem', background: '#f8f8f8', padding: '1.5rem', borderRadius: '8px' }}>
          <h4>Analysis Result:</h4>

          {result.issues && result.issues.length > 0 ? (
            <div>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {result.issues.map((issue, idx) => (
                  <li key={idx} style={{ marginBottom: '0.6rem' }}>
                    <strong>{issue.name}:</strong> {issue.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#555' }}>{result.message || 'No issues detected.'}</p>
          )}
        </div>
      )}
    </div>
  );
}
