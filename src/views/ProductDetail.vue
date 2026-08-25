<template>
  <div class="detail-container page-shell" v-loading="loading">
    <!-- 新增：面包屑导航和返回按钮 -->
    <el-row class="detail-topbar">
      <el-col :span="12">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">积分商品</el-breadcrumb-item>
          <el-breadcrumb-item>商品详情</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
      <el-col :span="12" class="detail-back">
        <el-button icon="el-icon-arrow-left" size="small" @click="$router.back()">返回上一页</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="32" v-if="product" class="detail-card">
      <el-col :xs="24" :md="12">
        <div class="product-preview">
          <img :src="product.imageUrl" />
          <span class="preview-hint"><i class="el-icon-zoom-in"></i> 悬停查看细节</span>
        </div>
      </el-col>
      <el-col :xs="24" :md="12" class="detail-info">
        <h2>{{ product.name }}</h2>
        <p class="desc">{{ product.description }}</p>
        <div class="product-meta">
          <el-tag effect="plain" type="primary">积分兑换</el-tag>
          <el-tag effect="plain" type="success">库存 {{ selectedSku ? selectedSku.stock : product.stock }}</el-tag>
        </div>
        <div class="points-box">
          <span class="label">所需积分：</span>
          <span class="value">{{ selectedSku ? selectedSku.points : product.points }}</span>
        </div>
        <div v-if="skus.length" class="sku-box">
          <span class="label">选择规格：</span>
          <el-radio-group v-model="selectedSkuId" size="small">
            <el-radio-button v-for="sku in skus" :key="sku.id" :label="sku.id">
              {{ sku.skuSpec || sku.skuCode }}（库存 {{ sku.stock }}）
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="quantity-box">
          <span class="label">兑换数量：</span>
          <el-input-number v-model="quantity" :min="1" :max="selectedSku ? selectedSku.stock : product.stock"></el-input-number>
        </div>
        <el-button type="primary" class="add-cart-button" @click="addToCart"><i class="el-icon-shopping-cart-2"></i> 加入购物车</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      product: null,
      skus: [],
      selectedSkuId: null,
      quantity: 1,
      loading: true
    }
  },
  created() {
    this.fetchProduct()
  },
  computed: {
    selectedSku() {
      return this.skus.find(sku => sku.id === this.selectedSkuId) || null
    }
  },
  methods: {
    async fetchProduct() {
      const id = this.$route.params.id
      try {
        const [productRes, skuRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/skus`)
        ])
        this.product = productRes.data
        this.skus = skuRes.data || []
        this.selectedSkuId = this.skus.length ? this.skus[0].id : null
      } finally {
        this.loading = false
      }
    },
    async addToCart() {
      if (!this.selectedSku) {
        this.$message.warning('请选择商品规格')
        return
      }
      await api.post('/cart', {
        productId: this.product.id,
        skuId: this.selectedSku.id,
        quantity: this.quantity
      })
      this.$message.success('已加入购物车')
      // 通知 App.vue 更新购物车小红点
      this.$root.$emit('cartUpdated')
    }
  }
}
</script>

<style scoped>
.detail-topbar { margin-bottom: 20px; padding: 14px 4px; }
.detail-back { text-align: right; }
.detail-card { padding: 24px; border: 1px solid var(--pm-border); border-radius: var(--pm-radius-lg); background: var(--pm-surface); box-shadow: var(--pm-shadow); }
.product-preview { position: relative; overflow: hidden; border-radius: var(--pm-radius); background: #eef5ff; }
.product-preview img { width: 100%; height: min(32vw, 460px); min-height: 360px; object-fit: cover; transition: transform .45s ease; }
.product-preview:hover img { transform: scale(1.08); }
.preview-hint { position: absolute; right: 12px; bottom: 12px; padding: 6px 10px; border-radius: 999px; color: #fff; background: rgba(15, 36, 65, .62); font-size: 12px; opacity: 0; transform: translateY(4px); transition: .25s ease; }
.product-preview:hover .preview-hint { opacity: 1; transform: translateY(0); }
.detail-info { padding: 8px 12px; }
.detail-info h2 { margin: 0; color: var(--pm-text); font-size: 30px; line-height: 1.3; }
.desc { margin: 16px 0; color: var(--pm-text-secondary); line-height: 1.8; }
.product-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.points-box { padding: 20px; border: 1px solid #ffd8d7; border-radius: var(--pm-radius); background: linear-gradient(135deg, #fff5f4, #fff); }
.points-box .label, .sku-box .label, .quantity-box .label { color: var(--pm-text-secondary); font-weight: 600; }
.points-box .value { margin-left: 8px; color: var(--pm-danger); font-size: 30px; font-weight: 800; }
.sku-box { display: flex; align-items: flex-start; gap: 12px; margin-top: 24px; }
.sku-box ::v-deep .el-radio-group { display: flex; flex-wrap: wrap; gap: 8px; }
.sku-box ::v-deep .el-radio-button__inner { border: 1px solid var(--pm-border); border-radius: 8px !important; box-shadow: none; }
.sku-box ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner { border-color: var(--pm-primary); color: var(--pm-primary); background: var(--pm-primary-soft); box-shadow: none; }
.quantity-box { display: flex; align-items: center; gap: 12px; margin-top: 24px; }
.quantity-box ::v-deep .el-input-number { border-radius: 8px; overflow: hidden; }
.add-cart-button { height: 44px; margin-top: 28px; padding: 0 28px; font-size: 16px; }
@media (max-width: 768px) { .detail-card { padding: 16px; } .detail-back { text-align: right; } .product-preview img { height: 72vw; min-height: 260px; } .detail-info { padding: 24px 0 0; } .detail-info h2 { font-size: 24px; } .sku-box { align-items: flex-start; flex-direction: column; } }
</style>
