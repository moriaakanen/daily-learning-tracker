'use client';

import React, { useState } from 'react';
import {
  BookMarked,
  KeyRound,
  User as UserIcon,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { User } from '@/types';
import { authenticateUser, registerUser } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';

interface AuthLandingPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
}

export function AuthLandingPage({
  onLoginSuccess,
  onContinueAsGuest,
}: AuthLandingPageProps) {
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

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authenticateUser(signInUsername, signInPassword);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Username atau password salah.');
      return;
    }

    setSuccessMessage(`Berhasil masuk sebagai ${result.user.name}!`);
    setTimeout(() => {
      onLoginSuccess(result.user!);
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
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gh-bg)] text-[var(--gh-text-primary)] transition-colors">
      {/* Top Brand Bar */}
      <header className="border-b border-[var(--gh-border)] bg-[var(--gh-surface)] py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--gh-accent)]" />
            <div className="font-semibold text-sm text-[var(--gh-text-primary)]">
              Daily LearnLog <span className="font-normal text-xs text-[var(--gh-text-secondary)]">• Portal Tim</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:underline hidden sm:inline"
            >
              Jelajah Mode Tamu
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Landing & Login Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side: Product Highlights */}
        <div className="flex-1 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] text-xs text-[var(--gh-accent)] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autentikasi Akun Pengguna</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--gh-text-primary)] leading-tight">
              Dokumentasikan Setiap Hal Baru yang Dipelajari.
            </h1>
            <p className="text-sm text-[var(--gh-text-secondary)] leading-relaxed">
              Jurnal pembelajaran harian untuk tim. Catat wawasan teknologi, bisnis, buku, sains, hingga produktivitas dengan dukungan editor Markdown, upload gambar, dan ruang diskusi.
            </p>
          </div>

          <div className="space-y-3 text-xs text-[var(--gh-text-secondary)]">
            <div className="flex items-start gap-2.5">
              <span className="text-[var(--gh-accent)] font-bold">✓</span>
              <span><strong>Akun Pribadi Aman:</strong> Setiap catatan terikat pada akun Anda dan hanya dapat diedit oleh pemilik akun.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[var(--gh-accent)] font-bold">✓</span>
              <span><strong>Upload Gambar & Markdown:</strong> Sisipkan gambar materi langsung dari komputer atau link eksternal.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[var(--gh-accent)] font-bold">✓</span>
              <span><strong>Feedback & Diskusi:</strong> Saling bertukar ide dan saran pada setiap catatan anggota tim.</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onContinueAsGuest}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--gh-accent)] hover:underline"
            >
              <span>Atau jelajahi catatan publik sebagai Tamu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: GitHub-Style Login Card */}
        <div className="w-full max-w-md rounded-lg border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xl overflow-hidden p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-[var(--gh-text-primary)]">
              {mode === 'signin' ? 'Masuk ke Daily LearnLog' : 'Daftar Akun Anggota Baru'}
            </h2>
            <p className="text-xs text-[var(--gh-text-secondary)]">
              {mode === 'signin'
                ? 'Masukkan username dan password akun Anda'
                : 'Lengkapi formulir untuk membuat akun baru'}
            </p>
          </div>

          {/* Error / Success Alert */}
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

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  placeholder="moriaakanen / alex_dev"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-2 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md pl-3 pr-9 py-2 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] font-mono"
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
                className="w-full py-2.5 px-4 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk ke Akun (Sign In)</span>
              </button>

              {/* Demo Hint */}
              <div className="p-2.5 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md text-[11px] text-[var(--gh-text-secondary)] space-y-0.5">
                <div className="flex items-center gap-1 font-semibold text-[var(--gh-text-primary)]">
                  <Info className="w-3 h-3 text-[var(--gh-accent)]" />
                  <span>Akun Demo Bawaan:</span>
                </div>
                <p>Username: <code className="text-[var(--gh-accent)] font-mono">moriaakanen</code>, <code className="text-[var(--gh-accent)] font-mono">alex_dev</code>, <code className="text-[var(--gh-accent)] font-mono">siti_data</code></p>
                <p>Password: <code className="text-[var(--gh-accent)] font-mono">password123</code></p>
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
                  Daftar akun baru
                </button>
              </div>
            </form>
          ) : (
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
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
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
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
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
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
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
                  placeholder="Contoh: Frontend Engineer / Researcher"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar & Masuk</span>
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
      </main>
    </div>
  );
}
