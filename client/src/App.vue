<script setup>
</script>

<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/report">Report Lost Item</router-link>
    <router-link to="/my-reports">My Reports</router-link>
  </nav>

  <router-view />
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}
</style>