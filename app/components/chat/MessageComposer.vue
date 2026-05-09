<script setup lang="ts">
import { SendHorizontal } from 'lucide-vue-next';

const props = defineProps<{
  disabled?: boolean;
}>();

const text = ref('');

const emit = defineEmits<{
  send: [text: string];
  typing: [isTyping: boolean];
}>();

const emitTypingState = () => {
  emit('typing', !props.disabled && Boolean(text.value.trim()));
};

const send = () => {
  if (props.disabled) return;
  const value = text.value.trim();
  if (!value) return;
  emit('send', value);
  text.value = '';
  emit('typing', false);
};

const onFocus = () => {
  emitTypingState();
};

const onBlur = () => {
  emitTypingState();
};

onBeforeUnmount(() => {
  emit('typing', false);
});

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  send();
};

watch(text, () => {
  emitTypingState();
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) emit('typing', false);
  },
);
</script>

<template>
  <form class="composer" @submit.prevent="send">
    <UTextarea
      v-model="text"
      placeholder="Message this room"
      :rows="1"
      :maxrows="4"
      autoresize
      variant="subtle"
      class="message-input"
      :disabled="disabled"
      :ui="{ base: 'min-h-11 py-2.5 text-[15px] leading-6 resize-none' }"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <UButton class="send-button" type="submit" color="primary" variant="solid" :disabled="disabled" aria-label="Send message">
      <SendHorizontal class="send-icon" :size="18" />
    </UButton>
  </form>
</template>

