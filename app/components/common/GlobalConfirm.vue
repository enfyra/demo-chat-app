<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next';

const { state, close } = useGlobalConfirm();
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="state.open" class="confirm-backdrop" @click.self="close(false)">
        <section class="confirm-dialog panel" role="alertdialog" aria-modal="true" :aria-label="state.title">
          <header class="confirm-header">
            <span class="confirm-icon" :class="{ destructive: state.destructive }">
              <AlertTriangle :size="18" />
            </span>
            <UButton color="neutral" variant="ghost" square aria-label="Close" :disabled="state.loading" @click="close(false)">
              <X :size="17" />
            </UButton>
          </header>

          <div class="confirm-copy">
            <h2>{{ state.title }}</h2>
            <p>{{ state.message }}</p>
            <small v-if="state.details">{{ state.details }}</small>
          </div>

          <label v-if="state.optionLabel" class="confirm-option">
            <input v-model="state.optionChecked" type="checkbox" :disabled="state.loading">
            <span>
              <strong>{{ state.optionLabel }}</strong>
              <small v-if="state.optionDescription">{{ state.optionDescription }}</small>
            </span>
          </label>

          <footer class="confirm-actions">
            <button class="confirm-button secondary" type="button" :disabled="state.loading" @click="close(false)">
              {{ state.cancelText }}
            </button>
            <button
              class="confirm-button primary"
              :class="{ destructive: state.destructive }"
              type="button"
              :disabled="state.loading"
              @click="close(true)"
            >
              {{ state.loading ? 'Working...' : state.confirmText }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, #000 54%, transparent);
  backdrop-filter: blur(8px);
  padding: 18px;
}

.confirm-dialog {
  width: min(28rem, 100%);
  box-shadow: 0 24px 80px color-mix(in srgb, #000 46%, transparent);
  padding: 16px;
}

.confirm-header,
.confirm-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.confirm-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--docs-border);
  border-radius: var(--radius);
  background: var(--docs-bg-subtle);
  color: var(--accent-strong);
}

.confirm-icon.destructive {
  border-color: color-mix(in srgb, var(--danger) 34%, transparent);
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}

.confirm-copy {
  padding: 14px 2px 18px;
}

.confirm-copy h2 {
  margin: 0 0 8px;
  font-size: 20px;
  line-height: 1.2;
}

.confirm-copy p,
.confirm-copy small {
  display: block;
  margin: 0;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.55;
}

.confirm-copy small {
  margin-top: 10px;
}

.confirm-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--docs-bg-subtle);
  margin-bottom: 16px;
  padding: 12px;
}

.confirm-option input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--accent-strong);
}

.confirm-option span,
.confirm-option strong,
.confirm-option small {
  display: block;
}

.confirm-option strong {
  font-size: 13px;
}

.confirm-option small {
  margin-top: 3px;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.45;
}

.confirm-actions {
  justify-content: flex-end;
}

.confirm-button {
  display: inline-flex;
  min-width: 82px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 0 15px;
  font-size: 14px;
  font-weight: 650;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    opacity 140ms ease;
}

.confirm-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.confirm-button.secondary {
  background: transparent;
  color: var(--foreground);
}

.confirm-button.secondary:not(:disabled):hover {
  background: var(--docs-bg-hover);
}

.confirm-button.primary {
  border-color: color-mix(in srgb, var(--foreground) 84%, transparent);
  background: var(--foreground);
  color: var(--background);
}

.confirm-button.primary:not(:disabled):hover {
  background: color-mix(in srgb, var(--foreground) 88%, var(--background));
}

.confirm-button.primary.destructive {
  border-color: var(--danger);
  background: var(--danger);
  color: #fff;
}

.confirm-button.primary.destructive:not(:disabled):hover {
  background: color-mix(in srgb, var(--danger) 86%, #000);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 140ms ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
