import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';

// Create account
export async function doCreateUserWithEmailAndPassword(email, password, displayName) {
  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(auth.currentUser, { displayName });
}

// Sign in
export async function doSignInWithEmailAndPassword(email, password) {
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

// Google login
export async function doSocialSignIn() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// Sign out
export async function doSignOut() {
  const auth = getAuth();
  await signOut(auth);
}

// Password reset
export async function doPasswordReset(email) {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

// Change password (requires reauth)
export async function doChangePassword(email, oldPassword, newPassword) {
  const auth = getAuth();
  const credential = EmailAuthProvider.credential(email, oldPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
  await doSignOut();
}
