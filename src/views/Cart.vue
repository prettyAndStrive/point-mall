<template>
  <div style="padding: 20px;">
    <h2>我的购物车</h2>
    <el-table :data="cartItems" style="width: 100%" border>
      <el-table-column prop="productName" label="商品名称"></el-table-column>
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

    <el-card style="margin-top: 20px; text-align: right;">
      总计积分：<span style="color: red; font-size: 24px;">{{ totalPoints }}</span>
      <el-button type="danger" style="margin-left: 20px;" @click="checkout">结算兑换</el-button>
    </el-card>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      cartItems: []
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
      const res = await api.get('/cart')
      this.cartItems = res.data
    },
    async updateQuantity(item) {
      // ==========================================
      // 后端接口：更新购物车商品数量
      // 请求方式：PUT /api/cart/{id}
      // 请求参数：{ quantity: item.quantity }
      // ==========================================
      await api.put(`/cart/${item.id}`, { quantity: item.quantity })
    },
    async removeItem(id) {
      // ==========================================
      // 后端接口：删除购物车商品
      // 请求方式：DELETE /api/cart/{id}
      // ==========================================
      await api.delete(`/cart/${id}`)
      this.$message.success('已移除')
      this.fetchCart()
    },
    async checkout() {
      // ==========================================
      // 后端接口：结算兑换
      // 请求方式：POST /api/orders/checkout
      // 返回数据：{ orderId: 123, message: "兑换成功" }
      // ==========================================
      try {
        const res = await api.post('/orders/checkout')
        this.$message.success(`兑换成功！订单号：${res.data.orderId}`)
        this.fetchCart()
      } catch (error) {
        // 错误已在拦截器中处理（如积分不足等）
      }
    }
  }
}
</script>
