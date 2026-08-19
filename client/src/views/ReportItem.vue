<template>
  <div class="report-item view-container">
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
        Venue
        <select v-model="form.venueId" required>
          <option value="">Select a venue</option>
          <option v-for="venue in venues" :key="venue._id" :value="venue._id">
            {{ venue.name }}
          </option>
        </select>
      </label>

      <label>
        Location lost (e.g. room number, area)
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
import { reactive, ref, onMounted } from 'vue'

const form = reactive({
  name: '',
  description: '',
  category: '',
  venueId: '',
  location: '',
  date: '',
})

const venues = ref([])
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/venues')
    venues.value = await response.json()
  } catch (err) {
    console.error('Failed to load venues:', err)
  }
})

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
    Object.assign(form, { name: '', description: '', category: '', venueId: '', location: '', date: '' })
  } catch (err) {
    error.value = err.message
  }
}
</script>