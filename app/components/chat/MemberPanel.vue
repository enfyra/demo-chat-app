<script setup lang="ts">
import { Bell, MessageSquareText, ShieldCheck, UserRoundCheck } from 'lucide-vue-next';
import type { Conversation } from '~/types/chat';

defineProps<{
  conversation: Conversation;
  currentUserId?: string;
  onlineUserIds?: ReadonlySet<string>;
}>();
</script>

<template>
  <aside class="member-panel panel">
    <section>
      <p class="eyebrow">Members</p>
      <div class="member-list">
        <div v-for="member in conversation.members" :key="member.id" class="member-row">
          <span class="member-avatar" :class="{ online: member.member.id !== currentUserId && onlineUserIds?.has(member.member.id) }">
            {{ member.member.displayName.slice(0, 1) }}
          </span>
          <span class="member-copy">
            <strong>{{ member.member.displayName }}</strong>
            <span>{{ member.member.id !== currentUserId && onlineUserIds?.has(member.member.id) ? 'online' : member.role }} · {{ member.member.email }}</span>
          </span>
        </div>
      </div>
    </section>

    <section class="boundary">
      <p class="eyebrow">Chat data</p>
      <div class="boundary-list">
        <div class="boundary-row">
          <span class="boundary-icon"><ShieldCheck :size="17" /></span>
          <span>Only members can see this chat</span>
        </div>
        <div class="boundary-row">
          <span class="boundary-icon"><MessageSquareText :size="17" /></span>
          <span>Messages sync across open devices</span>
        </div>
        <div class="boundary-row">
          <span class="boundary-icon"><Bell :size="17" /></span>
          <span>Offline users catch up from history</span>
        </div>
        <div class="boundary-row">
          <span class="boundary-icon"><UserRoundCheck :size="17" /></span>
          <span>People come from Enfyra users</span>
        </div>
      </div>
    </section>
  </aside>
</template>

