<template>
  <div class="my-reports">
    <h1>My Reports</h1>

    <p v-if="loading">Loading...</p>
    <p v-else-if="items.length === 0">No reports yet, or you're not logged in.</p>

    <ul v-else>
      <li v-for="item in items" :key="item.id">
        <strong>{{ item.name }}</strong> ({{ item.category }})
        <p>{{ item.description }}</p>
        <p>Lost at: {{ item.location }} on {{ item.date }}</p>
        <p>Status: {{ item.status }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    loading.value = false
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/items', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    items.value = await response.json()
  } catch (err) {
    console.error('Failed to load items:', err)
  } finally {
    loading.value = false
  }
})
</script>