<template>
  <div class="home-container page-shell">

    <!-- 顶部搜索区域 -->
    <div class="top-section home-search-bar">
      <el-row :gutter="20" type="flex" align="middle" class="search-row">
        <el-col :xs="24" :sm="7" :md="6">
          <h1 class="logo-text">积分商城</h1>
        </el-col>
        <el-col :xs="24" :sm="11" :md="12">
          <el-input placeholder="搜索你想要的商品" v-model="searchText" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="6" style="text-align: right;">
          <el-button type="text" @click="$router.push('/profile')">
            <i class="el-icon-user"></i> 我的积分: {{ userInfo.points || 0 }}
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 核心内容区：左侧分类 + 中间轮播 + 右侧用户信息 -->
    <el-skeleton :loading="loading" animated class="home-skeleton-wrap">
      <template slot="template">
        <div class="home-skeleton">
          <el-skeleton-item variant="rect" class="skeleton-category" />
          <div class="skeleton-content"><el-skeleton-item variant="image" class="skeleton-hero" /><div class="skeleton-cards"><el-skeleton-item v-for="n in 4" :key="n" variant="rect" /></div></div>
        </div>
      </template>
      <template>
    <div class="main-section">
      <el-row :gutter="10">

        <!-- 左侧分类导航：添加 sticky 定位使其悬浮 -->
        <el-col :xs="24" :md="5" class="category-col">
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
        <el-col :xs="24" :md="19" class="home-content-col">
          <!-- 轮播图和右侧面板 -->
          <el-row :gutter="10">
            <el-col :xs="24" :lg="17">
              <el-carousel class="hero-carousel" height="360px" indicator-position="outside" :interval="4500" arrow="hover">
                <el-carousel-item v-for="(banner, index) in banners" :key="index">
                  <img :src="banner.imageUrl" class="banner-img" @error="handleImageError" />
                </el-carousel-item>
              </el-carousel>
            </el-col>
            <el-col :xs="24" :lg="7" class="home-side-col">
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
              <el-col :xs="12" :sm="8" :md="6" v-for="product in floor.products" :key="product.id">
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
      </template>
    </el-skeleton>

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
      activeCategory: '', // 当前选中的分类ID
      loading: true
    }
  },
  created() {
    this.fetchHomeData()
  },
  methods: {
    async fetchHomeData() {
      this.loading = true
      try {
        const res = await api.get('/home/data')
        this.categories = res.data.categories
        this.banners = res.data.banners
        this.floors = res.data.floors

        // 默认选中第一个分类
        if (this.categories && this.categories.length > 0) {
          this.activeCategory = this.categories[0].floorId
        }
      } finally {
        this.loading = false
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
.home-container { padding-bottom: 8px; }
.home-skeleton { display: flex; gap: 16px; }.skeleton-category { width: 22%; height: 420px; border-radius: var(--pm-radius); }.skeleton-content { flex: 1; }.skeleton-hero { width: 100%; height: 280px; border-radius: var(--pm-radius); }.skeleton-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 20px; }.skeleton-cards .el-skeleton__item { height: 180px; border-radius: var(--pm-radius); }
.top-section, .floor-section, .side-panel, .category-list { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: var(--pm-radius); box-shadow: var(--pm-shadow); }
.top-section { padding: 20px 24px; margin-bottom: 24px; }
.logo-text { margin: 0; color: var(--pm-primary); font-size: 26px; font-weight: 800; letter-spacing: -.04em; }
.category-col { position: sticky; top: 96px; align-self: flex-start; z-index: 10; }
.category-list { overflow: hidden; padding: 8px; }
.category-item { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 8px; color: var(--pm-text-secondary); cursor: pointer; font-weight: 600; transition: background .2s ease, color .2s ease, transform .2s ease; }
.category-item:hover, .category-item.active { color: var(--pm-primary); background: var(--pm-primary-soft); transform: translateX(3px); }
.category-item i { width: 18px; text-align: center; }
.hero-carousel, .banner-img { border-radius: var(--pm-radius); overflow: hidden; }
.banner-img { width: 100%; height: 360px; object-fit: cover; transition: transform .7s ease; }
.hero-carousel:hover .banner-img { transform: scale(1.03); }
.hero-carousel ::v-deep .el-carousel__indicator.is-active button { background: var(--pm-primary); }
.side-panel { height: 360px; padding: 24px; }
.home-side-col { display: flex; }
.home-side-col .side-panel { width: 100%; }
.user-welcome { display: flex; align-items: center; }
.user-welcome p { margin: 0 0 8px; color: var(--pm-text); font-weight: 700; }
.notice-board h4 { margin: 0 0 12px; color: var(--pm-text); font-size: 16px; }
.notice-item { margin: 0 0 10px; overflow: hidden; color: var(--pm-text-secondary); cursor: pointer; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.notice-item:hover { color: var(--pm-primary); }
.floor-section { padding: 24px; margin-top: 24px; scroll-margin-top: 96px; }
.floor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--pm-border); }
.floor-header h3 { position: relative; margin: 0; color: var(--pm-text); font-size: 20px; }
.floor-header h3::before { display: inline-block; width: 4px; height: 20px; margin-right: 10px; border-radius: 4px; background: var(--pm-primary); content: ''; vertical-align: -3px; }
.product-card { height: 100%; min-height: 308px; margin-bottom: 16px; cursor: pointer; transition: transform .24s ease, box-shadow .24s ease; }
.product-card:hover { transform: translateY(-6px); box-shadow: var(--pm-shadow-hover); }
.product-card ::v-deep .el-card__body { padding: 0 16px 16px; }
.product-img { width: calc(100% + 32px); height: 176px; margin: 0 -16px 14px; object-fit: cover; }
.product-info { padding: 0; }
.product-name { margin: 0 0 6px; color: var(--pm-text); font-size: 15px; font-weight: 700; }
.product-desc { margin: 0 0 14px; color: var(--pm-text-secondary); font-size: 13px; }
.product-bottom { display: flex; align-items: center; justify-content: space-between; }
.product-points { color: var(--pm-danger); font-size: 17px; font-weight: 800; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 991px) { .category-col { position: static; margin-bottom: 16px; } .category-list { display: flex; overflow-x: auto; } .category-item { flex: 0 0 auto; } .home-content-col { width: 100%; } }
@media (max-width: 768px) { .home-skeleton { display: block; }.skeleton-category { width: 100%; height: 72px; margin-bottom: 16px; }.skeleton-cards { grid-template-columns: repeat(2, 1fr); }.top-section, .floor-section { padding: 16px; } .search-row > [class*='el-col'] { margin-bottom: 12px; } .search-row > [class*='el-col']:last-child { margin-bottom: 0; text-align: left !important; } .hero-carousel ::v-deep .el-carousel__container, .banner-img { height: clamp(200px, 56vw, 300px) !important; } .home-side-col { margin-top: 16px; } .side-panel { height: auto; min-height: 240px; } .floor-header h3 { font-size: 18px; } .product-card { min-height: 266px; } .product-img { height: 136px; } .product-desc { display: none; } }
</style>
