<template>
  <div class="report-item">
    <h1>Report a Lost Item</h1>
    <form @submit.prevent="submitReport">
      <label>
        Item name
        <input v-model="form.name" type="text" required />
      </label>

      <label>
        Description
        <textarea v-model="form.description" required></textarea>
      </label>

      <label>
        Category
        <select v-model="form.category" required>
          <option value="">Select a category</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="documents">Documents</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Location lost
        <input v-model="form.location" type="text" required />
      </label>

      <label>
        Date lost
        <input v-model="form.date" type="date" required />
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Report submitted successfully!</p>

      <button type="submit">Submit Report</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  description: '',
  category: '',
  location: '',
  date: '',
})

const error = ref('')
const success = ref(false)

async function submitReport() {
  error.value = ''
  success.value = false

  const token = localStorage.getItem('token')

  if (!token) {
    error.value = 'You must be logged in to report an item.'
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to submit report')
    }

    success.value = true
    Object.assign(form, { name: '', description: '', category: '', location: '', date: '' })
  } catch (err) {
    error.value = err.message
  }
}
</script>