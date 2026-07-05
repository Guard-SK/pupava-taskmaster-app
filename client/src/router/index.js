import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/client'
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue')
  },
  {
    path: '/projector',
    name: 'Projector',
    component: () => import('../views/ProjectorView.vue')
  },
  {
    path: '/client',
    name: 'Client',
    component: () => import('../views/ClientView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
