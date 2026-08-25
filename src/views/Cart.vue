<template>
  <div class="cart-page page-shell">
    <div class="cart-heading">
      <div>
        <h1 class="page-title">我的购物车</h1>
        <p class="page-subtitle">确认兑换商品与数量后即可提交订单</p>
      </div>
      <el-tag effect="plain" type="primary">{{ cartItems.length }} 种商品</el-tag>
    </div>
    <el-skeleton :loading="loading" animated class="cart-skeleton">
      <template slot="template"><el-skeleton-item variant="rect" class="cart-skeleton-item" /></template>
      <template>
    <el-table v-if="cartItems.length" :data="cartItems" :row-class-name="cartRowClassName" class="cart-table" style="width: 100%">
      <el-table-column label="商品" min-width="250">
        <template slot-scope="scope">
          <div class="cart-product">
            <img :src="scope.row.imageUrl" :alt="scope.row.productName" class="cart-product-image">
            <div><strong>{{ scope.row.productName }}</strong><p>{{ scope.row.skuSpec || '默认规格' }}</p></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="points" label="单价(积分)" width="120"></el-table-column>
      <el-table-column label="数量" width="180">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.quantity" :min="1" size="small" @change="updateQuantity(scope.row)"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="小计(积分)" width="120">
        <template slot-scope="scope">
          <span style="color: #e6a23c; font-weight: bold;">{{ scope.row.points * scope.row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="removeItem(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else class="pm-empty cart-empty" description="购物车还是空的，去挑选心仪商品吧">
      <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
    </el-empty>

    <div v-if="cartItems.length" class="cart-settlement">
      <span>合计积分</span><strong>{{ totalPoints }}</strong>
      <el-button type="primary" @click="checkout">结算兑换</el-button>
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
      cartItems: [],
      loading: true
    }
  },
  computed: {
  totalPoints() {
    // 确保 item.points 和 item.quantity 都存在才计算
    return this.cartItems.reduce((total, item) => {
      return total + (item.points || 0) * (item.quantity || 0)
    }, 0)
  }
  },
  created() {
    this.fetchCart()
  },
  methods: {
    async fetchCart() {
      // ==========================================
      // 后端接口：获取购物车列表
      // 请求方式：GET /api/cart
      // 返回数据：[{ id, productId, productName, points, quantity }]
      // ==========================================
      this.loading = true
      try {
        const res = await api.get('/cart')
        this.cartItems = res.data
      } finally {
        this.loading = false
      }
    },
    async updateQuantity(item) {
      // ==========================================
      // 后端接口：更新购物车商品数量
      // 请求方式：PUT /api/cart/{id}
      // 请求参数：{ quantity: item.quantity }
      // ==========================================
      await api.put(`/cart/${item.id}`, { quantity: item.quantity })
      this.notifyCartChanged()
    },
    async removeItem(id) {
      // ==========================================
      // 后端接口：删除购物车商品
      // 请求方式：DELETE /api/cart/{id}
      // ==========================================
      try {
        await this.$confirm('移除后可在商品页重新加入，是否继续？', '确认移除商品', {
          confirmButtonText: '确认移除',
          cancelButtonText: '暂不移除',
          type: 'warning'
        })
        await api.delete(`/cart/${id}`)
        this.$message.success('已移除')
        await this.fetchCart()
        this.notifyCartChanged()
      } catch (error) {
        // 用户取消时不触发请求；网络错误已由请求拦截器统一提示。
      }
    },
    async checkout() {
      // ==========================================
      // 后端接口：结算兑换
      // 请求方式：POST /api/orders/checkout
      // 返回数据：{ orderId: 123, message: "兑换成功" }
      // ==========================================
      try {
        const res = await api.post('/orders/checkout')
        this.$message.success(`兑换成功！订单号：${res.data.orderSn || res.data.orderId}`)
        await this.fetchCart()
        this.notifyCartChanged()
      } catch (error) {
        // 错误已在拦截器中处理（如积分不足等）
      }
    },
    notifyCartChanged() {
      // App.vue 统一从后端 /cart/count 刷新角标，避免页面各自维护不同的数量副本。
      this.$root.$emit('cartUpdated')
    },
    cartRowClassName({ row }) {
      return row.selected === false || row.selected === 0 ? '' : 'is-selected-cart-item'
    }
  }
}
</script>

<style scoped>
.cart-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; padding: 4px 0; }
.cart-skeleton-item { width: 100%; height: 320px; border-radius: var(--pm-radius); }
.cart-table { overflow: hidden; border: 1px solid var(--pm-border); border-radius: var(--pm-radius); box-shadow: var(--pm-shadow); }
.cart-table ::v-deep th { height: 52px; color: var(--pm-text-secondary); background: #f8fbff; font-weight: 700; }
.cart-table ::v-deep td { padding: 14px 0; border-bottom-color: var(--pm-border); }
.cart-table ::v-deep .el-table__row:hover > td { background: #f4f9ff !important; }
.cart-table ::v-deep .is-selected-cart-item > td { background: #fbfdff; }
.cart-product { display: flex; align-items: center; gap: 14px; }
.cart-product-image { width: 56px; height: 56px; border-radius: 10px; background: #edf3fa; object-fit: cover; }
.cart-product strong { color: var(--pm-text); font-size: 15px; }
.cart-product p { margin: 3px 0 0; color: var(--pm-text-secondary); font-size: 12px; }
.cart-table ::v-deep .el-input-number { border-radius: 999px; overflow: hidden; }
.cart-table ::v-deep .el-input-number__decrease, .cart-table ::v-deep .el-input-number__increase { color: var(--pm-primary); background: var(--pm-primary-soft); }
.cart-empty { margin-top: 12px; }
.cart-settlement { position: sticky; bottom: 16px; z-index: 10; display: flex; align-items: center; justify-content: flex-end; gap: 16px; margin-top: 24px; padding: 14px 20px; border: 1px solid #cfe3ff; border-radius: var(--pm-radius); background: rgba(255, 255, 255, .94); box-shadow: 0 12px 32px rgba(22, 119, 255, .14); backdrop-filter: blur(12px); }
.cart-settlement span { color: var(--pm-text-secondary); }
.cart-settlement strong { margin-right: 8px; color: var(--pm-danger); font-size: 28px; line-height: 1; }
.cart-settlement strong::after { content: ' 积分'; font-size: 13px; }
.cart-settlement .el-button { min-width: 116px; height: 42px; }
@media (max-width: 768px) { .cart-heading { margin-bottom: 16px; } .cart-heading .el-tag { display: none; } .cart-table ::v-deep .el-table__header-wrapper { display: none; } .cart-table ::v-deep .el-table__cell { padding: 10px 4px; } .cart-table ::v-deep .cell { padding: 0 4px; } .cart-table ::v-deep td:nth-child(2), .cart-table ::v-deep th:nth-child(2) { display: none; } .cart-product-image { width: 44px; height: 44px; } .cart-settlement { bottom: 8px; gap: 10px; padding: 12px; } .cart-settlement strong { font-size: 22px; } }
</style>
