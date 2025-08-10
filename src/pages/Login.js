import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={submit} style={{margin: '48px auto', maxWidth: 325, padding: 18, boxShadow: "0 2px 12px #0003"}}>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{display:'block',width:'100%',margin:'10px 0'}}/>
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" style={{display:'block',width:'100%',margin:'10px 0'}}/>
      <button type="submit" style={{width: "100%", padding: "10px 0"}}>Login</button>
      {error && <div style={{color:'tomato', marginTop:8}}>{error}</div>}
    </form>
  );
}
