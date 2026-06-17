<template>
  <div class="detail-container" v-loading="loading">
    <!-- 新增：面包屑导航和返回按钮 -->
    <el-row style="margin-bottom: 20px;">
      <el-col :span="12">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">积分商品</el-breadcrumb-item>
          <el-breadcrumb-item>商品详情</el-breadcrumb-item>
        </el-breadcrumb>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button icon="el-icon-arrow-left" size="small" @click="$router.back()">返回上一页</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-if="product">
      <el-col :span="12">
        <img :src="product.imageUrl" style="width: 100%; border-radius: 8px; max-height: 400px; object-fit: cover;" />
      </el-col>
      <el-col :span="12">
        <h2>{{ product.name }}</h2>
        <p class="desc">{{ product.description }}</p>
        <div class="points-box">
          <span class="label">所需积分：</span>
          <span class="value">{{ product.points }}</span>
        </div>
        <div style="margin-top: 20px;">
          <el-input-number v-model="quantity" :min="1" :max="product.stock"></el-input-number>
        </div>
        <el-button type="danger" style="margin-top: 20px;" @click="addToCart">加入购物车</el-button>
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
      quantity: 1,
      loading: true
    }
  },
  created() {
    this.fetchProduct()
  },
  methods: {
    async fetchProduct() {
      const id = this.$route.params.id
      const res = await api.get(`/products/${id}`)
      this.product = res.data
      this.loading = false
    },
    async addToCart() {
      await api.post('/cart', {
        productId: this.product.id,
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
.desc { color: #666; line-height: 1.8; margin: 20px 0; }
.points-box { background: #fdf6ec; padding: 15px; border-radius: 4px; }
.points-box .label { color: #666; }
.points-box .value { color: #e6a23c; font-size: 24px; font-weight: bold; }
</style>
