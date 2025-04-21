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
    <div style={{ padding: '2rem' }}>
      <h2>Health Coach Suggestions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {suggestions ? (
        <pre>{JSON.stringify(suggestions, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
