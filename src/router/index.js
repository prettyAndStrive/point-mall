import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'
import ProductList from '@/views/ProductList.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import Profile from '@/views/Profile.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
    { path: '/products', name: 'ProductList', component: ProductList, meta: { requiresAuth: true } },
    { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, meta: { requiresAuth: true } },
    { path: '/cart', name: 'Cart', component: Cart, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } }
  ]
})

// 路由守卫：未登录则跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
