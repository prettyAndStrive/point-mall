<template>
  <div class="product-list" style="padding: 20px;">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in products" :key="item.id">
        <el-card shadow="hover" class="product-card">
          <img :src="item.imageUrl" class="image">
          <div class="info">
            <h4>{{ item.name }}</h4>
            <p class="points">{{ item.points }} 积分</p>
            <el-button type="warning" size="small" @click="$router.push(`/product/${item.id}`)">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: center;">
    </el-pagination>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      products: [],
      total: 0,
      pageSize: 12,
      currentPage: 1
    }
  },
  created() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      // ==========================================
      // 后端接口：获取商品列表（分页）
      // 请求方式：GET /api/products?page=1&size=12
      // 返回数据：{ list: [], total: 0 }
      // ==========================================
      const res = await api.get('/products', {
        params: { page: this.currentPage, size: this.pageSize }
      })
      this.products = res.data.list
      this.total = res.data.total
    },
    handlePageChange(page) {
      this.currentPage = page
      this.fetchProducts()
    }
  }
}
</script>

<style scoped>
.product-card { margin-bottom: 20px; }
.image { width: 100%; height: 180px; object-fit: cover; }
.info { padding: 10px 0; text-align: center; }
.points { color: #e6a23c; font-weight: bold; margin: 10px 0; }
</style>
