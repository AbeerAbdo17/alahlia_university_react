import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// const API_BASE = "http://localhost:5000/api";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";



const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-page {
    font-family: "Cairo", "Tajawal", sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f0f4f8;
    direction: rtl;
  }

  /* ─── Background pattern ─── */
  .login-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(10,55,83,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 90%, rgba(14,165,233,0.13) 0%, transparent 60%),
      linear-gradient(160deg, #e8f0f7 0%, #f0f4f8 50%, #e2eef7 100%);
  }
  .login-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        rgba(10,55,83,0.04) 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 39px,
        rgba(10,55,83,0.04) 40px
      );
  }

  /* ─── Header ─── */
  .login-header {
    position: relative;
    z-index: 10;
    background: linear-gradient(90deg, #0a2540 0%, #0a3753 60%, #0e5f8a 100%);
    color: #fff;
    padding: 0 2.5rem;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 20px rgba(10,37,64,0.35);
  }
  .login-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9);
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .header-logo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
  }
  .header-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.01em;
  }
  .header-subtitle {
    font-size: 12px;
    color: #93c5fd;
    font-weight: 500;
    margin-top: 1px;
  }
  .header-year {
    font-size: 13px;
    color: #bae6fd;
    font-weight: 600;
    opacity: 0.8;
  }

  /* ─── Main ─── */
  .login-main {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  /* ─── Card ─── */
  .login-card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 24px;
    box-shadow:
      0 4px 6px rgba(10,37,64,0.04),
      0 10px 40px rgba(10,37,64,0.12),
      0 0 0 1px rgba(255,255,255,0.6) inset;
    width: 100%;
    max-width: 460px;
    padding: 2.8rem 2.6rem 2.4rem;
    animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ─── Card header ─── */
  .card-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #0a3753 0%, #0e5f8a 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.4rem;
    box-shadow: 0 8px 24px rgba(10,55,83,0.3);
    animation: iconPop 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes iconPop {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  .card-icon svg {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: #fff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .card-title {
    text-align: center;
    font-size: 26px;
    font-weight: 900;
    color: #0a2540;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
  }
  .card-desc {
    text-align: center;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 2.2rem;
    font-weight: 500;
  }

  /* ─── Divider ─── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    margin-bottom: 2rem;
  }

  /* ─── Fields ─── */
  .field {
    margin-bottom: 1.4rem;
    animation: fieldIn 0.4s both;
  }
  .field:nth-child(1) { animation-delay: 0.1s; }
  .field:nth-child(2) { animation-delay: 0.18s; }
  @keyframes fieldIn {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .field-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 8px;
    letter-spacing: 0.01em;
  }
  .field-label svg {
    width: 16px;
    height: 16px;
    stroke: #0a3753;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    flex-shrink: 0;
  }
  .input-wrap {
    position: relative;
  }
  .field-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid #dde3ec;
    background: #f8fafc;
    font-size: 15px;
    font-family: "Cairo", "Tajawal", sans-serif;
    color: #1e293b;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    direction: rtl;
  }
  .field-input:focus {
    border-color: #0a3753;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(10,55,83,0.1);
  }
  .field-input::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }
  .field-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ─── Eye toggle ─── */
  .eye-btn {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    color: #94a3b8;
    transition: color 0.2s;
    border-radius: 6px;
  }
  .eye-btn:hover { color: #0a3753; }
  .eye-btn svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    display: block;
  }
  .has-eye { padding-left: 44px; }

  /* ─── Submit ─── */
  .submit-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #0a2540 0%, #0a3753 50%, #0e5f8a 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 800;
    font-size: 17px;
    font-family: "Cairo", "Tajawal", sans-serif;
    margin-top: 0.6rem;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 16px rgba(10,55,83,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.01em;
    position: relative;
    overflow: hidden;
    animation: fieldIn 0.4s 0.26s both;
  }
  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
    border-radius: inherit;
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(10,55,83,0.45);
  }
  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(10,55,83,0.25);
  }
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  .submit-btn svg {
    width: 20px;
    height: 20px;
    stroke: #fff;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    flex-shrink: 0;
  }
  .spinner {
    width: 20px;
    height: 20px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Footer line ─── */
  .card-footer {
    text-align: center;
    margin-top: 1.8rem;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .card-footer svg {
    width: 14px;
    height: 14px;
    stroke: #94a3b8;
    stroke-width: 2;
    fill: none;
  }

  /* ─── Toast ─── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    padding: 12px 28px;
    border-radius: 50px;
    color: #fff;
    font-weight: 700;
    font-family: "Cairo", "Tajawal", sans-serif;
    font-size: 15px;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    white-space: nowrap;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .toast.error  { background: linear-gradient(135deg, #dc2626, #b91c1c); }
  .toast.success{ background: linear-gradient(135deg, #059669, #047857); }
  .toast svg {
    width: 18px;
    height: 18px;
    stroke: #fff;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    flex-shrink: 0;
  }

  /* ─── Footer bar ─── */
  .login-footer {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 14px;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
    border-top: 1px solid rgba(0,0,0,0.06);
    background: rgba(255,255,255,0.5);
  }
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('اسم المستخدم وكلمة المرور مطلوبين', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        full_name: data.full_name || '',
        email: data.email || '',
        role: data.role,
        allowed_pages: data.allowed_pages || [],
        allowed_faculties: data.allowed_faculties || [],
        registration_tab_permissions: data.registration_tab_permissions || {},
        allowed_program_types: data.allowed_program_types || [],
      }));

      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      showToast(err.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  const year = new Date().getFullYear();

  return (
    <>
      <style>{styles}</style>
      <div className="login-page" dir="rtl">
        <div className="login-bg" />

        {/* ── Header ── */}
        <header className="login-header">
          <div className="header-brand">
            <div>
              <div className="header-title">جامعة بورتسودان الأهلية</div>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="login-main">
          <div className="login-card">

            {/* Icon */}
            <div className="card-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            <h1 className="card-title">تسجيل الدخول</h1>
            <div className="divider" />

            <form onSubmit={handleLogin} noValidate>

              {/* Username */}
              <div className="field">
                <label className="field-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  اسم المستخدم
                </label>
                <div className="input-wrap">
                  <input
                    className="field-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    disabled={loading}
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  كلمة المرور
                </label>
                <div className="input-wrap">
                  <input
                    className={`field-input has-eye`}
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPass ? (
                      /* Eye-off */
                      <svg viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      /* Eye */
                      <svg viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" />
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                     دخول
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        {/* ── Footer bar ── */}
        <footer className="login-footer">
            جامعة بورتسودان الأهلية — النظام الأكاديمي<br />
            جميع الحقوق محفوظة © kian24        </footer>

        {/* ── Toast ── */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? (
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}