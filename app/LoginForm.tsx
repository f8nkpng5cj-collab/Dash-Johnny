'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError('Senha inválida. Se você não configurou variável na Vercel, use johnny123.');
  }

  return (
    <div className="loginWrap">
      <form className="loginCard" onSubmit={handleSubmit}>
        <h1 className="loginTitle">JOHNNY DASH</h1>
        <div className="loginSub">Acesso privado ao seu dashboard premium.</div>
        <input className="loginInput" type="password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primaryBtn" type="submit">Entrar</button>
        {error ? <div className="error">{error}</div> : null}
      </form>
    </div>
  );
}
