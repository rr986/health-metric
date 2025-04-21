import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../utils/firebase';

export default function Summary() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);

  const getLogs = async () => {
    const patientId = auth.currentUser?.uid;
    if (!patientId) return;

    try {
      const getFn = httpsCallable(functions, 'getHealthLogSummaryForDoctor');
      const res = await getFn({ patientId });
      setLogs(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Recent Health Logs</h2>
      <button onClick={getLogs}>Load My Logs</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {logs && <pre>{JSON.stringify(logs, null, 2)}</pre>}
    </div>
  );
}
