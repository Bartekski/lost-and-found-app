<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  router.push('/')
}
</script>

<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/report">Report Lost Item</router-link>
    <router-link to="/my-reports">My Reports</router-link>

    <span class="spacer"></span>

    <template v-if="user">
      <span>Hi, {{ user.name }}</span>
      <button @click="logout">Log Out</button>
    </template>
    <template v-else>
      <router-link to="/login">Log In</router-link>
      <router-link to="/register">Register</router-link>
    </template>
  </nav>

  <router-view />
</template>

<style scoped>
nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}
.spacer {
  flex: 1;
}
</style>