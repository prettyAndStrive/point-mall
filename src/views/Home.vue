<template>
  <div class="home-container">

    <!-- 顶部搜索区域 -->
    <div class="top-section">
      <el-row :gutter="20" type="flex" align="middle">
        <el-col :span="6">
          <h1 class="logo-text">积分商城</h1>
        </el-col>
        <el-col :span="12">
          <el-input placeholder="搜索你想要的商品" v-model="searchText" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-col>
        <el-col :span="6" style="text-align: right;">
          <el-button type="text" @click="$router.push('/profile')">
            <i class="el-icon-user"></i> 我的积分: {{ userInfo.points || 0 }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 核心内容区：左侧分类 + 中间轮播 + 右侧用户信息 -->
    <div class="main-section">
      <el-row :gutter="10">

        <!-- 左侧分类导航：添加 sticky 定位使其悬浮 -->
        <el-col :span="5" class="category-col">
          <div class="category-list">
            <div
                v-for="(cat, index) in categories"
                :key="index"
                class="category-item"
                :class="{ active: activeCategory === cat.floorId }"
                @click="scrollToFloor(cat.floorId)"
            >
              <i :class="cat.icon"></i>
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </el-col>

        <!-- 中间和右侧内容包裹起来 -->
        <el-col :span="19">
          <!-- 轮播图和右侧面板 -->
          <el-row :gutter="10">
            <el-col :span="17">
              <el-carousel height="360px" indicator-position="outside">
                <el-carousel-item v-for="(banner, index) in banners" :key="index">
                  <img :src="banner.imageUrl" class="banner-img" @error="handleImageError" />
                </el-carousel-item>
              </el-carousel>
            </el-col>
            <el-col :span="7">
              <div class="side-panel">
                <div class="user-welcome">
                  <el-avatar :size="50" icon="el-icon-user-solid"></el-avatar>
                  <div style="margin-left: 10px;">
                    <p>Hi, {{ userInfo.username || '游客' }}</p>
                    <el-button type="warning" size="mini" round @click="$router.push('/products')">去兑换</el-button>
                  </div>
                </div>
                <el-divider></el-divider>
                <div class="notice-board">
                  <h4>商城公告</h4>
                  <p v-for="(notice, index) in notices" :key="index" class="notice-item">
                    <el-tag size="mini" type="danger">新</el-tag> {{ notice }}
                  </p>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 楼层商品推荐区：动态绑定 id 用于锚点跳转 -->
          <div class="floor-section" v-for="(floor, index) in floors" :key="index" :id="floor.id">
            <div class="floor-header">
              <h3>{{ floor.title }}</h3>
              <el-button type="text" @click="$router.push('/products')">查看更多 >></el-button>
            </div>
            <el-row :gutter="15">
              <el-col :span="6" v-for="product in floor.products" :key="product.id">
                <el-card shadow="hover" class="product-card" @click.native="$router.push(`/product/${product.id}`)">
                  <img :src="product.imageUrl" class="product-img" @error="handleImageError">
                  <div class="product-info">
                    <p class="product-name ellipsis">{{ product.name }}</p>
                    <p class="product-desc ellipsis">{{ product.description }}</p>
                    <div class="product-bottom">
                      <span class="product-points">{{ product.points }} 积分</span>
                      <el-button type="warning" size="mini" round @click.stop="addToCart(product)">兑</el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-col>

      </el-row>
    </div>

  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
      searchText: '',
      categories: [],
      banners: [],
      notices: [
        '618积分大促，满减来袭！',
        '新品上架：智能手环限时兑换',
        '积分清零规则更新通知'
      ],
      floors: [],
      activeCategory: '' // 当前选中的分类ID
    }
  },
  created() {
    this.fetchHomeData()
  },
  methods: {
    async fetchHomeData() {
      const res = await api.get('/home/data')
      this.categories = res.data.categories
      this.banners = res.data.banners
      this.floors = res.data.floors

      // 默认选中第一个分类
      if (this.categories && this.categories.length > 0) {
        this.activeCategory = this.categories[0].floorId
      }
    },

    // 点击分类跳转楼层
    scrollToFloor(floorId) {
      this.activeCategory = floorId // 设置高亮状态
      const element = document.getElementById(floorId)
      if (element) {
        // 使用原生的 smooth 滚动动画
        element.scrollIntoView({ behavior: 'smooth' })
      }
    },

    handleSearch() {
      if(this.searchText) {
        this.$router.push({ path: '/products', query: { search: this.searchText } })
      }
    },

    async addToCart(product) {
      await api.post('/cart', { productId: product.id, quantity: 1 })
      this.$message.success('已加入购物车')
      this.$root.$emit('cartUpdated') // 通知App.vue更新购物车数字
    },

    // 图片加载失败时的占位处理
    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Yqg6L295aS05YOPPC90ZXh0Pjwvc3ZnPg=='
    }
  }
}
</script>

<style scoped>
.home-container {
  background-color: #f5f5f5; /* 电商经典浅灰背景 */
  padding-bottom: 30px;
}

/* 顶部搜索区 */
.top-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.logo-text {
  color: #e6a23c;
  margin: 0;
  font-size: 24px;
}

/* 核心内容区 */
.main-section {
  margin-bottom: 20px;
}

/* 左侧分类悬浮与高亮 */
.category-col {
  position: sticky;
  top: 60px; /* 距离顶部导航栏的高度，根据你的App.vue导航栏高度调整 */
  align-self: flex-start;
  z-index: 10;
}
.category-list {
  background: #fff;
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.category-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #333;
  border-left: 3px solid transparent; /* 预留左边高亮线 */
}
.category-item:hover {
  background-color: #fff8e6;
  color: #e6a23c;
  border-left-color: #e6a23c;
}
/* 选中的分类样式 */
.category-item.active {
  background-color: #fff8e6;
  color: #e6a23c;
  font-weight: bold;
  border-left-color: #e6a23c;
}
.category-item i {
  margin-right: 8px;
}

/* 轮播图与侧边栏 */
.banner-img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: 4px;
}
.side-panel {
  background: #fff;
  height: 360px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  box-sizing: border-box;
}
.user-welcome {
  display: flex;
  align-items: center;
}
.notice-board h4 {
  margin-top: 0;
  color: #333;
}
.notice-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  cursor: pointer;
}
.notice-item:hover {
  color: #e6a23c;
}

/* 楼层区 */
.floor-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 4px;
  /* 关键：锚点定位时，预留出顶部导航栏的高度，避免内容被遮挡 */
  scroll-margin-top: 70px;
}
.floor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e6a23c;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.floor-header h3 {
  margin: 0;
  color: #333;
}

/* 商品卡片 */
.product-card {
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.3s;
  height: 300px;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.product-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
}
.product-info {
  padding: 10px 0 0 0;
}
.product-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 5px;
}
.product-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 10px;
}
.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-points {
  color: #e6a23c;
  font-size: 16px;
  font-weight: bold;
}

/* 文本省略号 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
