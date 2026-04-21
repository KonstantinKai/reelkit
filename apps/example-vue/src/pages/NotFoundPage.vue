<script setup lang="ts"></script>

<template>
  <div class="page">
    <h1>404</h1>
    <p>Page not found.</p>
    <RouterLink to="/"> Go home </RouterLink>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #111;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
h1 {
  font-size: 4rem;
  margin: 0;
}
a {
  color: #6366f1;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
