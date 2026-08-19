<template>
  <div class="register view-container">
    <h1>Create an Account</h1>
    <form @submit.prevent="handleRegister">
      <label>
        Name
        <input v-model="form.name" type="text" required />
      </label>

      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" required minlength="6" />
      </label>

      <label>
        Account type
        <select v-model="form.role" required>
          <option value="guest">Guest</option>
          <option value="venue">Venue / Business</option>
        </select>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'guest',
})

async function handleRegister() {
  error.value = ''
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>