<template>
  <Teleport to="body">
    <div
      class="story-context-menu"
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop>
      <button
        v-for="item in items"
        :key="item.key"
        class="story-context-menu__item"
        :class="{ 'story-context-menu__item--danger': item.danger }"
        :disabled="item.disabled"
        type="button"
        @click="emit('select', item.key)">
        {{ item.label }}
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export type ContextMenuItem = {
  key: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
};

defineProps<{ x: number; y: number; items: ContextMenuItem[] }>();
const emit = defineEmits<{ select: [key: string] }>();
</script>

<style scoped>
.story-context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 190px;
  background: #1e1f24;
  border: 1px solid #34363f;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.story-context-menu__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  background: none;
  border: none;
  color: #e7e7ea;
  font-size: 13px;
  border-radius: 5px;
  cursor: pointer;
}

.story-context-menu__item:hover:not(:disabled) {
  background: #2c2e36;
}

.story-context-menu__item:disabled {
  color: #5c5e68;
  cursor: default;
}

.story-context-menu__item--danger {
  color: #f26b6b;
}
</style>
