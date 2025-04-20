import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../utils/firebase';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [output, setOutput] = useState(null);
  const router = useRouter();

  const auth = getAuth(app);
  const functions = getFunctions(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const testSecureStore = async () => {
    try {
      const secureStoreHealthData = httpsCallable(functions, 'secureStoreHealthData');
      const result = await secureStoreHealthData({
        trestbps: 135,
        chol: 220,
        thalach: 95,
        glucose: 110
      });
      setOutput(result.data);
    } catch (err) {
      console.error(err);
      setOutput({ error: err.message });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {user?.email}</h2>
      <button onClick={() => signOut(auth)}>Sign Out</button>

      <hr style={{ margin: '2rem 0' }} />

      <button onClick={testSecureStore}>Test secureStoreHealthData()</button>

      {output && (
        <pre style={{ marginTop: '2rem', background: '#f4f4f4', padding: '1rem' }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}
