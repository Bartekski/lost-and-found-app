import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ReportItem from '../views/ReportItem.vue'
import MyReports from '../views/MyReports.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/report', name: 'report', component: ReportItem },
    { path: '/my-reports', name: 'my-reports', component: MyReports },
    { path: '/register', name: 'register', component: Register },
    { path: '/login', name: 'login', component: Login },
  ],
})

export default router