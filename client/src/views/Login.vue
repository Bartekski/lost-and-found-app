<template>
  <div class="login view-container">
    <h1>Log In</h1>
    <form @submit.prevent="handleLogin">
      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" required />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit">Log In</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref('')

const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  error.value = ''
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>