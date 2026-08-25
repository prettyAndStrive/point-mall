<template>
  <section class="product-list page-shell">
    <header class="catalog-toolbar">
      <div>
        <h1 class="page-title">积分商品</h1>
        <p class="page-subtitle">精选好物，使用积分即可兑换</p>
      </div>
      <div class="catalog-controls" aria-label="当前商品筛选状态">
        <span class="control-label">商品筛选</span>
        <el-tag effect="plain" type="primary">{{ $route.query.search ? `搜索：${$route.query.search}` : '全部商品' }}</el-tag>
        <span class="sort-state"><i class="el-icon-sort"></i> 默认推荐</span>
      </div>
    </header>

    <el-skeleton v-if="loading" animated class="catalog-skeleton">
      <template slot="template">
        <div class="catalog-skeleton-grid">
          <div v-for="n in 4" :key="n" class="skeleton-card">
            <el-skeleton-item variant="image" class="skeleton-image" />
            <el-skeleton-item variant="text" class="skeleton-title" />
            <el-skeleton-item variant="text" class="skeleton-title skeleton-title-short" />
            <el-skeleton-item variant="text" class="skeleton-price" />
            <el-skeleton-item variant="rect" class="skeleton-button" />
          </div>
        </div>
      </template>

    </el-skeleton>

    <template v-else>
      <div v-if="products.length" class="points-goods-list">
        <article v-for="item in products" :key="item.id" class="points-goods-item">
          <el-card shadow="never" class="product-card">
            <div class="product-image-wrap">
              <img :src="item.imageUrl" :alt="item.name" class="image" loading="lazy">
              <span v-if="item.isHot" class="product-badge badge-hot">爆款</span>
              <span v-if="item.isNew" class="product-badge badge-new">新品</span>
              <span v-if="item.discountText" class="discount-ribbon">{{ item.discountText }}</span>
              <button class="favorite-button" type="button" :aria-label="`收藏 ${item.name}`" title="收藏商品">
                <span aria-hidden="true">♡</span>
              </button>
            </div>

            <div v-if="item.isHot || item.isNew || item.discountText" class="card-tag-row">
              <span v-if="item.isHot" class="tag-chip tag-chip-hot">人气兑换</span>
              <span v-if="item.isNew" class="tag-chip">新品上架</span>
              <span v-if="item.discountText" class="tag-chip">限时优惠</span>
            </div>

            <div class="info">
              <h2 class="product-title">{{ item.name }}</h2>
              <p class="points"><strong>{{ item.points }}</strong><span>积分</span></p>
              <el-button type="primary" size="small" @click="$router.push(`/product/${item.id}`)">查看详情</el-button>
            </div>
          </el-card>
        </article>
      </div>

      <el-empty v-else class="pm-empty" description="暂未找到匹配商品"></el-empty>
    </template>

    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
      class="catalog-pagination">
    </el-pagination>
  </section>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      products: [],
      total: 0,
      pageSize: 12,
      currentPage: 1,
      loading: true
    }
  },
  created() {
    this.fetchProducts()
  },
  watch: {
    '$route.query.search'() {
      this.currentPage = 1
      this.fetchProducts()
    }
  },
  methods: {
    async fetchProducts() {
      // 后端接口：GET /api/products?page=1&size=12&search=
      this.loading = true
      try {
        const res = await api.get('/products', {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            search: this.$route.query.search || ''
          }
        })
        this.products = res.data.list
        this.total = res.data.total
      } finally {
        this.loading = false
      }
    },
    handlePageChange(page) {
      this.currentPage = page
      this.fetchProducts()
    }
  }
}
</script>

<style scoped>
.product-list {
  --product-primary: #e4393c;
  --product-primary-dark: #c81623;
  min-width: 0;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fff;
}

.page-title { margin: 0; color: #303133; font-size: 22px; }
.page-subtitle { margin: 8px 0 0; color: #909399; font-size: 14px; }
.catalog-controls { display: flex; align-items: center; gap: 8px; color: #606266; font-size: 13px; }
.sort-state { padding: 5px 10px; border-radius: 14px; background: #f5f7fa; }

/* 兼容外部主题若额外插入 Skeleton 默认插槽包装层，保持其占满整行。 */
.catalog-skeleton { display: block; width: 100%; min-width: 0; }
.catalog-skeleton ::v-deep .el-skeleton__default {
  display: block !important;
  width: 100% !important;
  min-width: 0;
}

.points-goods-list,
.catalog-skeleton-grid {
  display: grid;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.points-goods-list { padding: 20px; border-radius: 10px; background: #f5f5f5; }
.points-goods-item { min-width: 0; }

.product-card {
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
  transition: transform .24s ease, box-shadow .24s ease;
}

.product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, .14); }
.product-card ::v-deep .el-card__body { display: flex; height: 100%; min-width: 0; flex-direction: column; padding: 0 14px 14px; }

.product-image-wrap { position: relative; width: calc(100% + 28px); margin: 0 -14px 12px; overflow: hidden; aspect-ratio: 1 / 1; background: #f5f7fa; }
.image { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
.product-card:hover .image { transform: scale(1.04); }

.product-badge { position: absolute; top: 8px; z-index: 1; padding: 3px 7px; border-radius: 3px; color: #fff; font-size: 12px; line-height: 1.4; }
.badge-hot { left: 8px; background: var(--product-primary); }
.badge-new { right: 8px; background: #6f7ff5; }
.discount-ribbon { position: absolute; right: 0; bottom: 0; left: 0; padding: 5px 8px; color: #fff; background: rgba(228, 57, 60, .9); font-size: 12px; }
.favorite-button { position: absolute; top: 8px; right: 8px; z-index: 2; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: rgba(0, 0, 0, .35); cursor: pointer; font-size: 20px; line-height: 1; }
.favorite-button:hover { color: var(--product-primary); background: #fff; }

.card-tag-row { display: flex; min-height: 22px; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.tag-chip { padding: 2px 5px; border-radius: 3px; color: #8a5a00; background: #fff7e6; font-size: 11px; }
.tag-chip-hot { color: var(--product-primary); background: #fff0f0; }
.info { display: flex; min-height: 116px; flex: 1; min-width: 0; flex-direction: column; }
.product-title { display: -webkit-box; min-height: 42px; margin: 0; overflow: hidden; color: #303133; font-size: 14px; font-weight: 500; line-height: 21px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.points { display: flex; align-items: baseline; gap: 4px; margin: 12px 0; color: var(--product-primary); }
.points strong { font-size: 24px; font-weight: 700; }.points span { font-size: 12px; }
.info .el-button { width: 100%; margin-top: auto; border-color: var(--product-primary); background: var(--product-primary); }
.info .el-button:hover { border-color: var(--product-primary-dark); background: var(--product-primary-dark); }

.skeleton-card { min-width: 0; overflow: hidden; padding: 0 14px 14px; border-radius: 8px; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, .06); }
.skeleton-image { display: block; width: calc(100% + 28px); margin: 0 -14px 14px; aspect-ratio: 1 / 1; }
.skeleton-title { display: block; width: 90%; height: 14px; margin-top: 10px; }.skeleton-title-short { width: 62%; }.skeleton-price { display: block; width: 40%; height: 20px; margin-top: 16px; }.skeleton-button { display: block; width: 100%; height: 32px; margin-top: 16px; }
.catalog-pagination { margin-top: 26px; text-align: center; }
</style>
