<template>
  <div class="my-reports">
    <h1>My Reports</h1>

    <p v-if="loading">Loading...</p>
    <p v-else-if="items.length === 0">No reports yet.</p>

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
  try {
    const response = await fetch('http://localhost:3000/api/items')
    items.value = await response.json()
  } catch (err) {
    console.error('Failed to load items:', err)
  } finally {
    loading.value = false
  }
})
</script>