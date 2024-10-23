import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AlgebraView from '@/views/AlgebraView.vue'
import AlgebraHomorphismsView from '@/views/AlgebraHomorphismsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:n/:id',
      name: 'algebra',
      component: AlgebraView,
      /*
      props: (route) => ({
        ...route.params,
        n: parseInt(route.params.n),
        id: BigInt(route.params.id)
      })
      */
    },
    {
      path: '/:n/:id/similar',
      name: 'algebra-homomorphisms',
      component: AlgebraHomorphismsView,
    },
  ],
})

export default router
