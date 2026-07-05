<template>
  <div class="min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-[var(--color-kahoot-red)] selection:text-white">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { socket } from './socket';

onMounted(() => {
  socket.on('connect', () => {
    console.log('Connected to backend:', socket.id);
  });
});
</script>

<style>
/* Base fade transition for routes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
