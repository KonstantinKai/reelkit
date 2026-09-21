<script setup lang="ts">
/**
 * A labelled group of exclusive choices, the demo pages' switcher control.
 * Purely presentational: the caller owns the state and passes `active` per
 * option.
 */
defineProps<{
  legend: string;
  options: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
  }[];
}>();
</script>

<template>
  <fieldset class="seg">
    <legend>{{ legend }}</legend>
    <div class="seg-row">
      <button
        v-for="option in options"
        :key="option.label"
        type="button"
        :class="{ on: option.active }"
        :disabled="option.disabled"
        @click="option.onClick"
      >
        {{ option.label }}
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
.seg {
  border: 0;
  padding: 0;
  margin: 0;
}

.seg legend {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
  margin-bottom: 6px;
}

.seg-row {
  display: flex;
  gap: 6px;
}

.seg-row button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}

.seg-row button.on {
  background: rgba(99, 102, 241, 0.55);
}

.seg-row button:disabled {
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}
</style>
