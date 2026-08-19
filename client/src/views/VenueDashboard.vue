<template>
  <div class="venue-dashboard">
    <h1>Venue Dashboard</h1>

    <p v-if="!isVenue">This page is only available to venue accounts.</p>

    <template v-else>
      <p v-if="loading">Loading...</p>
      <p v-else-if="items.length === 0">No reports yet.</p>

      <ul v-else>
        <li v-for="item in items" :key="item._id">
          <strong>{{ item.name }}</strong> ({{ item.category }}) - {{ item.status }}
          <p>{{ item.description }}</p>
          <p>Lost at: {{ item.location }} on {{ item.date }}</p>
          <button v-if="item.status === 'lost'" @click="markAsFound(item._id)">
            Mark as Found
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)
const user = JSON.parse(localStorage.getItem('user') || 'null')
const isVenue = user?.role === 'venue'

async function loadItems() {
  const token = localStorage.getItem('token')
  if (!token) {
    loading.value = false
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/items/all', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    items.value = await response.json()
  } catch (err) {
    console.error('Failed to load items:', err)
  } finally {
    loading.value = false
  }
}

async function markAsFound(id) {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:3000/api/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'found' }),
    })

    if (!response.ok) throw new Error('Failed to update item')

    await loadItems()
  } catch (err) {
    console.error(err)
  }
}

onMounted(loadItems)
</script>