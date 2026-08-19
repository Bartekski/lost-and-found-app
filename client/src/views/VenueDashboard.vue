<template>
  <div class="venue-dashboard view-container">
    <h1>Venue Dashboard</h1>

    <p v-if="!isVenue">This page is only available to venue accounts.</p>

    <template v-else>
      <div class="filters">
        <input v-model="searchText" type="text" placeholder="Search by name or category..." />
        <select v-model="statusFilter">
          <option value="">All statuses</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      <p v-if="loading">Loading...</p>
      <p v-else-if="filteredItems.length === 0">No matching reports.</p>

      <ul v-else>
        <li v-for="item in filteredItems" :key="item._id">
          <strong>{{ item.name }}</strong> ({{ item.category }}) - {{ item.status }}
          <p>{{ item.description }}</p>
          <p>Lost at: {{ item.location }} on {{ item.date }}</p>
          <router-link :to="{ path: `/chat/${item._id}`, query: { name: item.name } }">Chat</router-link>
          <button v-if="item.status === 'lost'" @click="markAsFound(item._id)">
            Mark as Found
          </button>
          <button @click="deleteItem(item._id)" class="danger">Delete</button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)
const user = JSON.parse(localStorage.getItem('user') || 'null')
const isVenue = user?.role === 'venue'

const searchText = ref('')
const statusFilter = ref('')

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.value.toLowerCase())
    const matchesStatus = !statusFilter.value || item.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

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

async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this report?')) return

  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:3000/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to delete item')

    await loadItems()
  } catch (err) {
    console.error(err)
  }
}

onMounted(loadItems)
</script>