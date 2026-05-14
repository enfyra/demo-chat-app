import { io, type Socket } from 'socket.io-client';
import type { Ref } from 'vue';
import type { ChatMessage, NewConversationPayload, TypingUser } from '~/types/chat';

interface UseChatSocketOptions {
  activeId: Ref<string>;
  getPresenceUserIds: () => string[];
  upsertMessage: (message: ChatMessage) => void;
  touchConversationPreview: (conversationId: string, text: string, createdAt: string) => void;
  hasConversation: (conversationId: string) => boolean;
  refreshConversations: (options?: { silent?: boolean }) => Promise<void>;
  removeConversation: (conversationId: string) => void;
  setConversationUnread: (conversationId: string, unread: boolean) => void;
}

export const useChatSocket = ({ activeId, getPresenceUserIds, upsertMessage, touchConversationPreview, hasConversation, refreshConversations, removeConversation, setConversationUnread }: UseChatSocketOptions) => {
  const { user } = useAuth();
  const socketState = ref<'connecting' | 'connected' | 'offline' | 'failed'>('connecting');
  const reconnectAttempt = ref(0);
  const reconnectLimit = 5;
  const reconnectCountdown = ref(0);
  const hasConnectionProblem = ref(false);
  const showReconnectBanner = computed(() => socketState.value === 'failed');
  const typingUsers = ref<TypingUser[]>([]);
  const onlineUserIds = ref<Set<string>>(new Set());
  let socket: Socket | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let typingHeartbeat: ReturnType<typeof setInterval> | null = null;
  let presenceHeartbeat: ReturnType<typeof setInterval> | null = null;
  let typingActive = false;
  let disconnecting = false;
  const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const presenceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const pendingNewConversations = new Map<string, (conversationId: string) => void>();
  const idOf = (value: unknown) => value == null ? '' : `${value}`;

  const clearCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    reconnectCountdown.value = 0;
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const startCountdown = (ms: number) => {
    clearCountdown();
    reconnectCountdown.value = Math.max(1, Math.ceil(ms / 1000));
    countdownTimer = setInterval(() => {
      reconnectCountdown.value = Math.max(0, reconnectCountdown.value - 1);
      if (reconnectCountdown.value <= 0) clearCountdown();
    }, 1000);
  };

  const scheduleReconnect = () => {
    if (!socket || socket.connected || reconnectTimer || socketState.value === 'failed') return;
    hasConnectionProblem.value = true;
    if (reconnectAttempt.value >= reconnectLimit) {
      socketState.value = 'failed';
      clearCountdown();
      return;
    }
    reconnectAttempt.value += 1;
    socketState.value = 'connecting';
    const delay = Math.min(1000 * 2 ** Math.max(0, reconnectAttempt.value - 1), 10_000);
    startCountdown(delay);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!socket || socket.connected || socketState.value === 'failed') return;
      socket.connect();
    }, delay);
  };

  const joinConversationRooms = () => {
    if (!socket?.connected || !user.value?.id) return;
    socket.emit('chat:join');
  };

  const emitPresence = () => {
    if (!socket?.connected || !user.value?.id) return false;
    const userIds = Array.from(new Set(getPresenceUserIds().map(idOf).filter(Boolean))).filter((item) => item !== idOf(user.value?.id));
    if (userIds.length === 0) return false;
    socket.emit('chat:presence', { userIds });
    return true;
  };

  const emitRead = (conversationId = activeId.value) => {
    if (!socket?.connected || !conversationId || conversationId === 'draft') return false;
    socket.emit('chat:read', {
      conversationId,
      readAt: new Date().toISOString(),
    });
    return true;
  };

  const removeTypingUser = (userId: string) => {
    const timer = typingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      typingTimers.delete(userId);
    }
    typingUsers.value = typingUsers.value.filter((item) => item.userId !== userId);
  };

  const markPresence = (userId: string, isOnline: boolean) => {
    const normalizedId = idOf(userId);
    if (!normalizedId || normalizedId === idOf(user.value?.id)) return;
    const timer = presenceTimers.get(normalizedId);
    if (timer) {
      clearTimeout(timer);
      presenceTimers.delete(normalizedId);
    }
    const next = new Set(onlineUserIds.value);
    if (!isOnline) {
      next.delete(normalizedId);
      onlineUserIds.value = next;
      return;
    }
    next.add(normalizedId);
    onlineUserIds.value = next;
    presenceTimers.set(normalizedId, setTimeout(() => {
      presenceTimers.delete(normalizedId);
      const expired = new Set(onlineUserIds.value);
      expired.delete(normalizedId);
      onlineUserIds.value = expired;
    }, 45_000));
  };

  const sendTyping = (isTyping: boolean) => {
    if (!socket?.connected || !activeId.value || activeId.value === 'draft') return;
    socket.emit('chat:typing', {
      conversationId: activeId.value,
      isTyping,
    });
  };

  const stopTypingHeartbeat = () => {
    if (typingHeartbeat) {
      clearInterval(typingHeartbeat);
      typingHeartbeat = null;
    }
    typingActive = false;
  };

  const startPresenceHeartbeat = () => {
    emitPresence();
    if (!presenceHeartbeat) {
      presenceHeartbeat = setInterval(() => {
        emitPresence();
      }, 15_000);
    }
  };

  const stopPresenceHeartbeat = () => {
    if (presenceHeartbeat) {
      clearInterval(presenceHeartbeat);
      presenceHeartbeat = null;
    }
  };

  const connect = () => {
    if (socket || import.meta.server) return;
    disconnecting = false;
    socketState.value = 'connecting';
    socket = io('/chat', {
      withCredentials: true,
      reconnection: false,
      transports: ['polling'],
      upgrade: false,
    });

    socket.on('connect', () => {
      socketState.value = 'connected';
      hasConnectionProblem.value = false;
      reconnectAttempt.value = 0;
      clearReconnectTimer();
      clearCountdown();
      joinConversationRooms();
      startPresenceHeartbeat();
    });
    socket.on('connect_error', () => {
      scheduleReconnect();
    });
    socket.io.on('error', () => {
      scheduleReconnect();
    });
    socket.io.on('close', () => {
      scheduleReconnect();
    });
    socket.on('disconnect', () => {
      stopPresenceHeartbeat();
      if (disconnecting) return;
      scheduleReconnect();
    });
    const onMessage = (message: any) => {
      const conversationId = idOf(message.conversationId);
      const text = message.text || '';
      const createdAt = message.createdAt || new Date().toISOString();
      if (!conversationId || !message.id) return;
      if (!hasConversation(conversationId)) {
        void refreshConversations({ silent: true }).then(() => {
          touchConversationPreview(conversationId, text, createdAt);
          joinConversationRooms();
        });
      }
      upsertMessage({
        id: idOf(message.id),
        conversationId,
        sender: message.sender || user.value,
        text,
        createdAt,
        status: 'delivered',
      });
      touchConversationPreview(conversationId, text, createdAt);
      if (conversationId === idOf(activeId.value) || idOf(message.senderId) === idOf(user.value?.id)) {
        setConversationUnread(conversationId, false);
        emitRead(conversationId);
      } else {
        setConversationUnread(conversationId, true);
      }
    };
    socket.on('chat:message', onMessage);
    socket.on('chat:message:sent', onMessage);
    socket.on('chat:new', (payload: any) => {
      const conversationId = idOf(payload?.conversationId);
      if (!conversationId) return;
      const resolve = payload.requestId ? pendingNewConversations.get(payload.requestId) : null;
      if (payload.requestId) pendingNewConversations.delete(payload.requestId);
      void refreshConversations({ silent: true }).then(() => {
        if (!resolve && conversationId !== idOf(activeId.value)) {
          setConversationUnread(conversationId, true);
        }
        joinConversationRooms();
        resolve?.(conversationId);
      });
    });
    socket.on('chat:deleted', (payload: any) => {
      const conversationId = idOf(payload?.conversationId);
      if (!conversationId) return;
      removeConversation(conversationId);
      void refreshConversations({ silent: true }).then(joinConversationRooms);
    });
    socket.on('chat:read', (payload: any) => {
      const conversationId = idOf(payload?.conversationId);
      if (idOf(payload?.userId) === idOf(user.value?.id) && conversationId) {
        setConversationUnread(conversationId, false);
      }
    });
    socket.on('chat:typing', (payload: any) => {
      const conversationId = idOf(payload?.conversationId);
      const sender = payload?.sender;
      const userId = idOf(sender?.id || payload?.senderId);
      if (!conversationId || !userId || userId === idOf(user.value?.id)) return;
      if (!payload.isTyping) {
        removeTypingUser(userId);
        return;
      }
      const displayName = sender?.displayName || sender?.email || 'Someone';
      typingUsers.value = [
        ...typingUsers.value.filter((item) => item.userId !== userId),
        { conversationId, userId, displayName },
      ];
      const existingTimer = typingTimers.get(userId);
      if (existingTimer) clearTimeout(existingTimer);
      typingTimers.set(userId, setTimeout(() => removeTypingUser(userId), 3500));
    });
    socket.on('chat:presence', (payload: any) => {
      markPresence(payload?.userId, payload?.isOnline !== false);
    });
    socket.on('chat:presence:state', (payload: any) => {
      for (const item of payload?.users || []) {
        markPresence(item?.userId, item?.isOnline === true);
      }
    });
    socket.on('chat:joined', () => {
      socketState.value = 'connected';
      startPresenceHeartbeat();
    });
  };

  const disconnect = () => {
    disconnecting = true;
    clearReconnectTimer();
    socket?.disconnect();
    stopTypingHeartbeat();
    stopPresenceHeartbeat();
    for (const timer of typingTimers.values()) clearTimeout(timer);
    for (const timer of presenceTimers.values()) clearTimeout(timer);
    typingTimers.clear();
    presenceTimers.clear();
    typingUsers.value = [];
    onlineUserIds.value = new Set();
    socket = null;
    socketState.value = 'offline';
    hasConnectionProblem.value = false;
    clearCountdown();
  };

  const reloadForRetry = () => {
    clearReconnectTimer();
    clearCountdown();
    reconnectAttempt.value = 0;
    hasConnectionProblem.value = true;
    socketState.value = 'connecting';
    socket?.connect();
  };

  const emitMessage = (text: string, messageId: string) => {
    if (!socket?.connected || !activeId.value) return false;
    socket.emit('chat:message', {
      conversationId: idOf(activeId.value),
      messageId,
      text,
    });
    return true;
  };

  const emitTyping = (isTyping: boolean) => {
    if (!isTyping) {
      if (typingActive) sendTyping(false);
      stopTypingHeartbeat();
      return;
    }
    typingActive = true;
    sendTyping(true);
    if (!typingHeartbeat) {
      typingHeartbeat = setInterval(() => {
        if (typingActive) sendTyping(true);
      }, 1200);
    }
  };

  const emitNewConversation = (payload: NewConversationPayload) => {
    if (!socket?.connected) return Promise.resolve('');
    const requestId = `new-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise<string>((resolve) => {
      const timer = window.setTimeout(() => {
        pendingNewConversations.delete(requestId);
        resolve('');
      }, 8000);
      pendingNewConversations.set(requestId, (conversationId) => {
        window.clearTimeout(timer);
        resolve(conversationId);
      });
      socket?.emit('chat:new', { ...payload, requestId });
    });
  };

  const emitDeleteConversation = (conversationId: string, scope: 'self' | 'everyone') => {
    if (!socket?.connected || !conversationId) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => resolve(false), 8000);
      socket?.once('chat:deleted:done', (payload: any) => {
        window.clearTimeout(timer);
        resolve(payload?.conversationId === conversationId);
      });
      socket?.emit('chat:delete', { conversationId, scope });
    });
  };

  return {
    socketState,
    reconnectAttempt,
    reconnectLimit,
    reconnectCountdown,
    showReconnectBanner,
    typingUsers,
    onlineUserIds,
    connect,
    disconnect,
    reloadForRetry,
    joinConversationRooms,
    emitRead,
    emitMessage,
    emitTyping,
    emitNewConversation,
    emitDeleteConversation,
  };
};
