import { User } from '@/types';

export const DEFAULT_TEAM_USERS: User[] = [
  {
    id: 'user-1',
    username: 'moriaakanen',
    name: 'Moria Akanen',
    role: 'Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-2',
    username: 'alex_dev',
    name: 'Alex Pratama',
    role: 'Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-3',
    username: 'siti_data',
    name: 'Siti Rahma',
    role: 'Data Scientist & AI',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-4',
    username: 'budi_ops',
    name: 'Budi Santoso',
    role: 'DevOps Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-5',
    username: 'nadia_design',
    name: 'Nadia Putri',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
];

const CURRENT_USER_KEY = 'daily_learning_current_user_v2';
const TEAM_USERS_KEY = 'daily_learning_team_users_v2';

export function getTeamUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_TEAM_USERS;
  try {
    const raw = localStorage.getItem(TEAM_USERS_KEY);
    if (!raw) {
      localStorage.setItem(TEAM_USERS_KEY, JSON.stringify(DEFAULT_TEAM_USERS));
      return DEFAULT_TEAM_USERS;
    }
    const parsed = JSON.parse(raw);
    // Ensure every user has a password field
    return parsed.map((u: User) => ({
      ...u,
      password: u.password || 'password123',
    }));
  } catch (e) {
    return DEFAULT_TEAM_USERS;
  }
}

export function saveTeamUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEAM_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving team users', e);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      // Don't store password in session for cleanliness
      const sanitized = { ...user, password: '' };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitized));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting current user', e);
  }
}

export function logoutUser() {
  setCurrentUser(null);
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: User; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase().replace(/^@/, '');
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Mohon masukkan username dan password.' };
  }

  const users = getTeamUsers();
  const foundUser = users.find(
    (u) => u.username.toLowerCase() === cleanUsername
  );

  if (!foundUser) {
    return {
      success: false,
      error: `Username "${cleanUsername}" tidak ditemukan. Silakan daftar jika belum memiliki akun.`,
    };
  }

  const userPassword = foundUser.password || 'password123';
  if (userPassword !== cleanPassword) {
    return {
      success: false,
      error: 'Password yang Anda masukkan salah. Mohon periksa kembali.',
    };
  }

  setCurrentUser(foundUser);
  return { success: true, user: foundUser };
}

export function registerUser(
  name: string,
  username: string,
  passwordInput: string,
  role?: string
): { success: boolean; user?: User; error?: string } {
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '_');
  const cleanPassword = passwordInput.trim();

  if (!cleanName || !cleanUsername || !cleanPassword) {
    return { success: false, error: 'Nama, username, dan password wajib diisi.' };
  }

  if (cleanPassword.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter.' };
  }

  const users = getTeamUsers();
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return { success: false, error: `Username "${cleanUsername}" sudah digunakan oleh anggota lain.` };
  }

  const id = 'user-' + Date.now().toString(36);
  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  ];
  const avatar = avatars[users.length % avatars.length];

  const newUser: User = {
    id,
    name: cleanName,
    username: cleanUsername,
    role: role?.trim() || 'Anggota Tim',
    avatar,
    password: cleanPassword,
  };

  const updated = [...users, newUser];
  saveTeamUsers(updated);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}
