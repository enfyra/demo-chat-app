<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <UButton color="neutral" variant="outline" square :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`" @click="toggleTheme">
    <Sun v-if="theme === 'dark'" :size="18" />
    <Moon v-else :size="18" />
  </UButton>
</template>
