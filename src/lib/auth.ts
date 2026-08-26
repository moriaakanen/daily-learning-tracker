import { User } from '@/types';

export const DEFAULT_TEAM_USERS: User[] = [
  {
    id: 'user-1',
    username: 'moriaakanen',
    name: 'Moria Akanen',
    role: 'Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-2',
    username: 'alex_dev',
    name: 'Alex Pratama',
    role: 'Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-3',
    username: 'siti_data',
    name: 'Siti Rahma',
    role: 'Data Scientist & AI',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-4',
    username: 'budi_ops',
    name: 'Budi Santoso',
    role: 'DevOps Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-5',
    username: 'nadia_design',
    name: 'Nadia Putri',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
];

const CURRENT_USER_KEY = 'daily_learning_current_user';
const TEAM_USERS_KEY = 'daily_learning_team_users';

export function getTeamUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_TEAM_USERS;
  try {
    const raw = localStorage.getItem(TEAM_USERS_KEY);
    if (!raw) {
      localStorage.setItem(TEAM_USERS_KEY, JSON.stringify(DEFAULT_TEAM_USERS));
      return DEFAULT_TEAM_USERS;
    }
    return JSON.parse(raw);
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
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
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

export function createNewUser(name: string, username: string, role?: string): User {
  const users = getTeamUsers();
  const id = 'user-' + Date.now().toString(36);
  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  ];
  const avatar = avatars[users.length % avatars.length];

  const newUser: User = {
    id,
    name: name.trim(),
    username: username.trim().toLowerCase().replace(/\s+/g, '_'),
    role: role?.trim() || 'Anggota Tim',
    avatar,
  };

  const updated = [...users, newUser];
  saveTeamUsers(updated);
  setCurrentUser(newUser);
  return newUser;
}
