<template>
  <div class="profile view-container">
    <h1>My Profile</h1>

    <p v-if="loading">Loading...</p>

    <form v-else @submit.prevent="saveProfile">
      <label>
        Name
        <input v-model="form.name" type="text" required />
      </label>

      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>

      <label v-if="role === 'venue'">
        Address
        <input v-model="form.address" type="text" placeholder="e.g. 123 Main Street, Brussels" />
      </label>

      <label>
        New password (leave blank to keep current)
        <input v-model="form.password" type="password" minlength="6" />
      </label>

      <p><strong>Account type:</strong> {{ role }}</p>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Profile updated!</p>

      <button type="submit">Save Changes</button>

    </form>

    <button @click="deleteAccount" class="danger" style="margin-top: 1.5rem;">
      Delete My Account
    </button>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const success = ref(false)
const role = ref('')

const form = reactive({
  name: '',
  email: '',
  address: '',
  password: '',
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const data = await response.json()
    form.name = data.name
    form.email = data.email
    form.address = data.address || ''
    role.value = data.role
  } catch (err) {
    error.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

async function saveProfile() {
  error.value = ''
  success.value = false
  const token = localStorage.getItem('token')

  try {
    const body = { name: form.name, email: form.email, address: form.address }
    if (form.password) body.password = form.password

    const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('Failed to update profile')

    const updated = await response.json()

    const stored = JSON.parse(localStorage.getItem('user'))
    stored.name = updated.name
    stored.email = updated.email
    localStorage.setItem('user', JSON.stringify(stored))

    success.value = true
    form.password = ''
  } catch (err) {
    error.value = err.message
  }
}


async function deleteAccount() {
  if (!confirm('Are you sure? This will permanently delete your account and all your reports. This cannot be undone.')) return

  const token = localStorage.getItem('token')
  try {
    const response = await fetch('http://localhost:3000/api/auth/account', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to delete account')

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  } catch (err) {
    console.error(err)
  }
}
</script>