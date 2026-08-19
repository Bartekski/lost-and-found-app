<template>
  <div class="item-chat">
    <h1>Chat about: {{ itemName }}</h1>

    <div class="messages">
      <p v-if="loading">Loading...</p>
      <p v-else-if="messages.length === 0">No messages yet. Say hello!</p>
      <div v-for="msg in messages" :key="msg._id" class="message">
        <strong>{{ msg.senderName }}:</strong> {{ msg.text }}
      </div>
    </div>

    <form @submit.prevent="sendMessage">
      <input v-model="newMessage" type="text" placeholder="Type a message..." required />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const itemId = route.params.id
const itemName = ref(route.query.name || 'Item')

const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
let pollInterval = null

async function loadMessages() {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:3000/api/items/${itemId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    messages.value = await response.json()
  } catch (err) {
    console.error('Failed to load messages:', err)
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  const token = localStorage.getItem('token')
  if (!newMessage.value.trim()) return

  try {
    await fetch(`http://localhost:3000/api/items/${itemId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text: newMessage.value }),
    })
    newMessage.value = ''
    await loadMessages()
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

onMounted(() => {
  loadMessages()
  pollInterval = setInterval(loadMessages, 3000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
})
</script>

<style scoped>
.messages {
  border: 1px solid #ccc;
  padding: 1rem;
  min-height: 200px;
  margin-bottom: 1rem;
}
.message {
  margin-bottom: 0.5rem;
}
form {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
}
</style>