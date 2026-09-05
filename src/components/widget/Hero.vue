<template>
  <div class="flex flex-row gap-2 items-center justify-start w-full">
    <img src="/sp_gradient.png" class="w-30 h-30 aspect-square select-none" />
    <div>
      <h1 class="text-8xl select-none hero-header">Shakespeare</h1>
      <p class="text-muted text-xl select-none">The story editor for Unity.</p>
    </div>
  </div>
</template>
<style scoped>
.hero-header {
  background: radial-gradient(
    circle,
    rgba(245, 235, 182, 1) 0%,
    rgba(215, 134, 74, 1) 35%,
    var(--color-primary) 100%
  );

  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: gradient-scroll 3s linear infinite;
}

@keyframes gradient-scroll {
  from {
    background-position: 200% 50%;
  }
  to {
    background-position: 0% 50%;
  }
}
</style>
