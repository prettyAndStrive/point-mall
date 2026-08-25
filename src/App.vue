<template>
  <div id="app">
    <!-- 只有在登录和注册页不显示导航栏 -->
    <el-container v-if="$route.name !== 'Login' && $route.name !== 'Register'" class="app-layout">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="logo" @click="$router.push('/')">积分商城</div>
        <el-menu class="main-nav" :default-active="$route.path" mode="horizontal" router>
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/products">积分商品</el-menu-item>
        </el-menu>
        <div class="user-info">
          <el-badge :value="cartCount" class="item" type="danger" :hidden="cartCount === 0">
            <el-button icon="el-icon-shopping-cart-2" circle @click="$router.push('/cart')"></el-button>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ userInfo.username }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体内容渲染区 -->
      <el-main class="app-main">
        <transition name="fade-page" mode="out-in">
          <router-view/>
        </transition>
      </el-main>
    </el-container>

    <!-- 登录和注册页全屏显示，不带导航栏 -->
    <div v-else>
      <transition name="fade-page" mode="out-in">
        <router-view/>
      </transition>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
      cartCount: 0
    }
  },
  created() {
    // 监听登录成功和加入购物车的事件，实时更新头部数据
    this.$root.$on('userInfoUpdated', this.updateUserInfo)
    this.$root.$on('cartUpdated', this.fetchCartCount)
    
    if (localStorage.getItem('token')) {
      this.fetchCartCount()
    }
  },
  beforeDestroy() {
    this.$root.$off('userInfoUpdated', this.updateUserInfo)
    this.$root.$off('cartUpdated', this.fetchCartCount)
  },
  methods: {
    async fetchCartCount() {
      if (!localStorage.getItem('token')) return;
      try {
        const res = await api.get('/cart/count')
        this.cartCount = res.data.count
      } catch (error) {
        console.log('获取购物车数量失败')
      }
    },
    updateUserInfo() {
      this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      this.fetchCartCount()
    },
    handleCommand(command) {
      if (command === 'profile') {
        this.$router.push('/profile')
      } else if (command === 'logout') {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        this.userInfo = {}
        this.cartCount = 0
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style>
.app-layout { min-height: 100vh; background: var(--pm-bg); }
.header {
  position: sticky;
  top: 0;
  height: 72px !important;
  padding: 0 max(24px, calc((100vw - 1400px) / 2));
  display: flex; 
  align-items: center; 
  justify-content: flex-start;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 4px 18px rgba(31, 57, 88, .06);
  backdrop-filter: blur(16px);
  z-index: 100;
}
.logo { color: var(--pm-primary); cursor: pointer; font-size: 22px; font-weight: 800; letter-spacing: -.04em; margin-right: 40px; }
.main-nav { border-bottom: 0; background: transparent; }
.main-nav.el-menu--horizontal > .el-menu-item { height: 72px; line-height: 72px; padding: 0 18px; color: var(--pm-text-secondary); border-bottom: 3px solid transparent; }
.main-nav.el-menu--horizontal > .el-menu-item:hover { color: var(--pm-primary); background: transparent; }
.main-nav.el-menu--horizontal > .el-menu-item.is-active { color: var(--pm-primary); border-bottom-color: var(--pm-primary); }
.user-info { display: flex; align-items: center; gap: 20px; margin-left: auto; }
.user-info .el-button.is-circle { width: 40px; height: 40px; color: var(--pm-primary); border-color: #d6e8ff; background: var(--pm-primary-soft); }
.el-dropdown-link { cursor: pointer; color: var(--pm-text); font-weight: 600; }
.app-main { padding: 24px 0 48px; overflow: visible; }

@media (max-width: 768px) {
  .header { height: 60px !important; padding: 0 12px; }
  .logo { margin-right: 8px; font-size: 18px; }
  .main-nav.el-menu--horizontal > .el-menu-item { height: 60px; line-height: 60px; padding: 0 10px; font-size: 13px; }
  .user-info { gap: 10px; }
  .el-dropdown-link { max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
  .app-main { padding: 16px 0 32px; }
}
</style>
