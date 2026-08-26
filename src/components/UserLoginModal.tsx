'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  BookMarked,
  Info,
} from 'lucide-react';
import { User } from '@/types';
import { authenticateUser, registerUser } from '@/lib/auth';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export function UserLoginModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}: UserLoginModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('Anggota Tim');

  // Error & Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authenticateUser(signInUsername, signInPassword);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Autentikasi gagal.');
      return;
    }

    setSuccessMessage(`Selamat datang kembali, ${result.user.name}!`);
    setTimeout(() => {
      onLoginSuccess(result.user!);
      setSignInUsername('');
      setSignInPassword('');
      setSuccessMessage(null);
      onClose();
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = registerUser(
      signUpName,
      signUpUsername,
      signUpPassword,
      signUpRole
    );

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Pendaftaran akun gagal.');
      return;
    }

    setSuccessMessage(`Akun @${result.user.username} berhasil dibuat!`);
    setTimeout(() => {
      onLoginSuccess(result.user!);
      setSignUpName('');
      setSignUpUsername('');
      setSignUpPassword('');
      setSuccessMessage(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[400px] rounded-lg border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--gh-accent)]" />
            <span className="font-semibold text-xs tracking-wide text-[var(--gh-text-primary)]">
              Daily LearnLog
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Currently Logged In State */}
        {currentUser ? (
          <div className="p-6 text-center space-y-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full mx-auto border-2 border-[var(--gh-border)] object-cover shadow-sm"
            />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[var(--gh-text-primary)]">
                {currentUser.name}
              </h2>
              <p className="text-xs text-[var(--gh-text-secondary)]">
                @{currentUser.username} {currentUser.role ? `• ${currentUser.role}` : ''}
              </p>
            </div>

            <div className="p-3 bg-[var(--gh-surface)] rounded-md border border-[var(--gh-border)] text-xs text-[var(--gh-text-secondary)]">
              Anda sedang masuk ke akun ini. Untuk menggunakan akun lain, Anda harus keluar terlebih dahulu dan memasukkan username serta password akun tersebut.
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 px-4 rounded-md border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs transition-colors"
              >
                Keluar dari Akun (Sign Out)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-primary)] transition-colors"
              >
                Kembali ke Aplikasi
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Title */}
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-[var(--gh-text-primary)] tracking-tight">
                {mode === 'signin' ? 'Masuk ke Akun Anda' : 'Buat Akun Anggota Baru'}
              </h2>
              <p className="text-xs text-[var(--gh-text-secondary)]">
                {mode === 'signin'
                  ? 'Masukkan username dan password akun Anda'
                  : 'Daftarkan nama & password untuk mulai menulis'}
              </p>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
                    <span>Username Akun</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={signInUsername}
                    onChange={(e) => setSignInUsername(e.target.value)}
                    placeholder="Contoh: moriaakanen atau alex_dev"
                    className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-3 py-2 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
                      <span>Password</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Masukkan password Anda..."
                      className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md pl-3 pr-9 py-2 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Sekarang (Sign In)</span>
                </button>

                {/* Demo accounts hint */}
                <div className="p-2.5 bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md text-[11px] text-[var(--gh-text-secondary)] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[var(--gh-text-primary)]">
                    <Info className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                    <span>Akun Tim Bawaan:</span>
                  </div>
                  <p>
                    Username: <code className="text-[var(--gh-accent)]">moriaakanen</code>, <code className="text-[var(--gh-accent)]">alex_dev</code>, <code className="text-[var(--gh-accent)]">siti_data</code>
                  </p>
                  <p>
                    Password: <code className="text-[var(--gh-accent)]">password123</code>
                  </p>
                </div>

                <div className="pt-2 text-center text-xs text-[var(--gh-text-secondary)]">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('signup');
                    }}
                    className="text-[var(--gh-accent)] hover:underline font-semibold"
                  >
                    Daftar di sini
                  </button>
                </div>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                    Username Unik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder="Contoh: rian_dev"
                    className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Buat password rahasia..."
                    className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                    Role / Spesialisasi
                  </label>
                  <input
                    type="text"
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value)}
                    placeholder="Contoh: Frontend Engineer / Data Analyst"
                    className="w-full bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru</span>
                </button>

                <div className="pt-2 text-center text-xs text-[var(--gh-text-secondary)]">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('signin');
                    }}
                    className="text-[var(--gh-accent)] hover:underline font-semibold"
                  >
                    Masuk di sini
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
