'use client';

import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Check,
  Plus,
  LogOut,
  Shield,
  Sparkles,
} from 'lucide-react';
import { User } from '@/types';
import { createNewUser } from '@/lib/auth';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  teamUsers: User[];
  onSelectUser: (user: User) => void;
  onUserCreated: (newUser: User) => void;
}

export function UserLoginModal({
  isOpen,
  onClose,
  currentUser,
  teamUsers,
  onSelectUser,
  onUserCreated,
}: UserLoginModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('Anggota Tim');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) {
      alert('Mohon isi nama lengkap dan username.');
      return;
    }
    const created = createNewUser(newName, newUsername, newRole);
    onUserCreated(created);
    setIsCreating(false);
    setNewName('');
    setNewUsername('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-md rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[var(--gh-accent)]" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--gh-text-primary)]">
                {isCreating ? 'Tambah Profil Pengguna' : 'Ganti / Masuk Sebagai Pengguna'}
              </h2>
              <p className="text-[11px] text-[var(--gh-text-secondary)]">
                Akun tim internal (kurang dari 10 pengguna)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {!isCreating ? (
            <>
              <div className="space-y-1">
                <span className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
                  Pilih akun pengguna yang aktif:
                </span>

                <div className="space-y-2 pt-1 max-h-[280px] overflow-y-auto">
                  {teamUsers.map((user) => {
                    const isActive = user.id === currentUser.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          onClose();
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-md border transition-all cursor-pointer ${
                          isActive
                            ? 'border-[var(--gh-accent)] bg-[var(--gh-surface-hover)] shadow-xs'
                            : 'border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full border border-[var(--gh-border)] object-cover"
                          />
                          <div>
                            <div className="font-semibold text-xs text-[var(--gh-text-primary)] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isActive && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--gh-text-secondary)]">
                              @{user.username} {user.role ? `• ${user.role}` : ''}
                            </div>
                          </div>
                        </div>

                        {isActive && <Check className="w-4 h-4 text-[var(--gh-accent)]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--gh-border)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--gh-accent)] hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota Tim Baru</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-primary)]"
                >
                  Tutup
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: rian_dev"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
                  Role / Spesialisasi
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Contoh: Frontend Developer / Researcher"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
                />
              </div>

              <div className="pt-2 border-t border-[var(--gh-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Simpan & Masuk
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
