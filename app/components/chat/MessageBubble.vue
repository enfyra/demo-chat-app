<script setup lang="ts">
import { CheckCheck, Clock, TriangleAlert } from 'lucide-vue-next';
import type { ChatMessage } from '~/types/chat';

const props = defineProps<{
  message: ChatMessage;
  own: boolean;
  position?: 'single' | 'first' | 'middle' | 'last';
  showMeta?: boolean;
}>();

const timeLabel = computed(() => new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(props.message.createdAt)));
</script>

<template>
  <div class="bubble-row" :class="{ own }">
    <div class="bubble" :class="[own ? 'own' : '', `position-${position || 'single'}`]">
      <p>{{ message.text }}</p>
    </div>
    <span v-if="showMeta" class="bubble-meta">
      {{ timeLabel }}
      <Clock v-if="message.status === 'sending'" :size="13" />
      <TriangleAlert v-else-if="message.status === 'failed'" :size="13" />
      <CheckCheck v-else :size="13" />
    </span>
  </div>
</template>
