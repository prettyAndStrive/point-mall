<template>
  <div id="app">
    <!-- 只有在登录和注册页不显示导航栏 -->
    <el-container v-if="$route.name !== 'Login' && $route.name !== 'Register'" style="height: 100vh">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="logo" @click="$router.push('/')">积分商城</div>
        <el-menu :default-active="$route.path" mode="horizontal" router background-color="#fff" text-color="#333" active-text-color="#409EFF">
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
      <el-main>
        <router-view/>
      </el-main>
    </el-container>

    <!-- 登录和注册页全屏显示，不带导航栏 -->
    <div v-else>
      <router-view/>
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
/* 全局样式 */
body { margin: 0; padding: 0; font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif; }

.header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  background: #fff; 
  box-shadow: 0 2px 4px rgba(0,0,0,.1); 
  z-index: 999;
}
.logo { font-size: 20px; font-weight: bold; color: #409EFF; cursor: pointer; margin-right: 20px;}
.user-info { display: flex; align-items: center; gap: 20px; }
.el-dropdown-link { cursor: pointer; color: #409EFF; }
</style>
