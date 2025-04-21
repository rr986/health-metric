import { useEffect, useState } from 'react';
import { auth, functions } from '../utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { useRouter } from 'next/router';

export default function Coach() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoachTips = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const coachFn = httpsCallable(functions, 'healthCoachSuggestions');
        const res = await coachFn({ uid });
        setSuggestions(res.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCoachTips();
  }, []);

  if (!auth.currentUser) {
    router.push('/login');
    return null;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Personalized Health Coach</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {suggestions ? (
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>Current Risk Level:</strong> {suggestions.baselineRisk}</p>
          <p><strong>Coach Message:</strong> {suggestions.message}</p>

          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Recommendations:</strong>
              <ul>
                {suggestions.suggestions.map((s, index) => (
                  <li key={index}>
                    <strong>{s.recommendation}</strong> – {s.estimatedImpact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>Loading coach insights...</p>
      )}
    </div>
  );
}
