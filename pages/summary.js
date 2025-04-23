import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../utils/firebase';

export default function Summary() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLogs = async () => {
    const patientId = auth.currentUser?.uid;
    if (!patientId) return;

    setLoading(true);
    setError(null);
    setLogs(null);

    try {
      const getFn = httpsCallable(functions, 'getHealthLogSummaryForDoctor');
      const res = await getFn({ patientId });
      setLogs(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Your Recent Health Logs</h2>
      <p>This shows the most recent entries recorded in your health history.</p>
      <button onClick={getLogs} disabled={loading} style={{ padding: '0.6rem 1rem' }}>
        {loading ? 'Loading...' : 'Load My Logs'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {logs && (
        <div style={{ marginTop: '1.5rem' }}>
          {logs.logs && logs.logs.length > 0 ? (
            <div>
              <h4>Most Recent Entries:</h4>
              {logs.logs.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <p><strong>Date:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
                  <p><strong>Resting Blood Pressure (trestbps):</strong> {entry.trestbps}</p>
                  <p><strong>Cholesterol (chol):</strong> {entry.chol}</p>
                  <p><strong>Max Heart Rate (thalach):</strong> {entry.thalach}</p>
                  <p><strong>Glucose:</strong> {entry.glucose}</p>
                </div>
              ))}
              <p><em>{logs.summary}</em></p>
            </div>
          ) : (
            <p>No logs available.</p>
          )}
        </div>
      )}
    </div>
  );
}
