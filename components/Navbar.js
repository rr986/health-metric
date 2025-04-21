import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav style={{ background: '#1e88e5', padding: '1rem', display: 'flex', gap: '1rem', color: '#fff' }}>
      <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
      <Link href="/coach" style={{ color: '#fff', textDecoration: 'none' }}>Coach</Link>
      <Link href="/prescriptions" style={{ color: '#fff', textDecoration: 'none' }}>Prescriptions</Link>
      <Link href="/summary" style={{ color: '#fff', textDecoration: 'none' }}>Summary</Link>
      {user ? (
        <span style={{ marginLeft: 'auto' }}>Welcome, {user.email}</span>
      ) : (
        <Link href="/login" style={{ marginLeft: 'auto', color: '#fff' }}>Login</Link>
      )}
    </nav>
  );
}
