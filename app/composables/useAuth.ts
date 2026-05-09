import type { ChatUser } from '~/types/chat';

interface LoginPayload {
  email: string;
  password: string;
}

const mapAuthUser = (value: any): ChatUser | null => {
  const row = value?.data?.[0] || value?.data || value || null;
  if (!row?.id) return null;
  return {
    id: row.id,
    email: row.email || '',
    displayName: row.displayName || row.display_name || row.email || 'Unknown user',
    avatarUrl: row.avatarUrl || row.avatar_url || null,
    statusText: row.statusText || row.status_text || null,
    lastSeenAt: row.lastSeenAt || row.last_seen_at || row.updatedAt || null,
  };
};

export const useAuth = () => {
  const api = useEnfyraApi();
  const currentUser = useState<ChatUser | null>('auth:user', () => null);
  const authLoading = useState('auth:loading', () => false);
  const authReady = useState('auth:ready', () => false);
  const isLoggedIn = computed(() => Boolean(currentUser.value?.id));

  const fetchUser = async () => {
    authLoading.value = true;
    try {
      currentUser.value = mapAuthUser(await api.get('/me'));
    } catch {
      currentUser.value = null;
    } finally {
      authReady.value = true;
      authLoading.value = false;
    }
    return currentUser.value;
  };

  const login = async (payload: LoginPayload) => {
    authLoading.value = true;
    try {
      await api.post('/login', payload);
      return await fetchUser();
    } finally {
      authLoading.value = false;
    }
  };

  const logout = async () => {
    authLoading.value = true;
    try {
      await api.post('/logout');
    } finally {
      currentUser.value = null;
      authReady.value = true;
      authLoading.value = false;
      await navigateTo('/login');
    }
  };

  const loginWithGoogle = () => {
    if (import.meta.server) return;
    const { enfyraAppUrl } = useRuntimeConfig().public;
    const redirectUrl = new URL('/chat', window.location.origin);
    const oauthUrl = new URL('/api/auth/google', enfyraAppUrl);
    oauthUrl.searchParams.set('redirect', redirectUrl.toString());
    oauthUrl.searchParams.set('cookieBridgePrefix', '/enfyra');
    window.location.href = oauthUrl.toString();
  };

  return {
    user: currentUser,
    isLoggedIn,
    isLoading: authLoading,
    isReady: authReady,
    fetchUser,
    login,
    logout,
    loginWithGoogle,
  };
};
