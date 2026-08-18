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

  try {
    const response = await fetch('http://localhost:3000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      throw new Error('Failed to submit report')
    }

    success.value = true
    Object.assign(form, { name: '', description: '', category: '', location: '', date: '' })
  } catch (err) {
    error.value = err.message
  }
}
</script>