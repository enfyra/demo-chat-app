<script setup lang="ts">
import { Hash, MessageCircle } from 'lucide-vue-next';
import type { ChatListItem } from '~/types/chat';

const props = defineProps<{
  item: ChatListItem;
  active: boolean;
  currentUserId?: string;
  onlineUserIds?: ReadonlySet<string>;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

const formatTime = (value?: string) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
};

const hasUnread = computed(() => Boolean(props.item.unreadCount || props.item.conversation.unreadCount));
const peerUser = computed(() => {
  if (props.item.conversation.kind !== 'dm') return null;
  return props.item.members.find((member) => member.id !== props.currentUserId) || null;
});
const isPeerOnline = computed(() => Boolean(peerUser.value?.id && props.onlineUserIds?.has(peerUser.value.id)));
</script>

<template>
  <button class="conversation-row" :class="{ active, unread: hasUnread }" type="button" @click="emit('select', item.conversation.id)">
    <span class="conversation-avatar" :class="{ online: isPeerOnline }">
      <Hash v-if="item.conversation.kind === 'group'" :size="17" />
      <MessageCircle v-else :size="17" />
    </span>
      <span class="conversation-main">
      <span class="conversation-title-line">
        <span class="conversation-title truncate">{{ item.conversation.title }}</span>
        <span v-if="hasUnread" class="conversation-unread-dot" aria-label="Unread messages" />
        <span class="conversation-time">{{ formatTime(item.conversation.lastMessageAt) }}</span>
      </span>
      <span class="conversation-preview truncate">{{ item.conversation.lastMessageText }}</span>
    </span>
  </button>
</template>

