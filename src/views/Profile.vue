<template>
  <div style="padding: 20px;">
    <el-row :gutter="20">
      <!-- 左侧用户信息 -->
      <el-col :span="8">
        <el-card>
          <div class="user-profile">
            <el-avatar :size="80" icon="el-icon-user-solid"></el-avatar>
            <h3>{{ userInfo.username }}</h3>
            <p>当前积分：<span class="points">{{ userInfo.points }}</span></p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧订单记录 -->
      <el-col :span="16">
        <el-card>
          <div slot="header"><span>兑换记录</span></div>
          <el-table :data="orders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="120"></el-table-column>
            <el-table-column prop="productName" label="商品名称"></el-table-column>
            <el-table-column prop="costPoints" label="消耗积分" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="兑换时间"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
      orders: []
    }
  },
  created() {
    this.fetchUserInfo()
    this.fetchOrders()
  },
  methods: {
    async fetchUserInfo() {
      // ==========================================
      // 后端接口：获取最新用户信息（特别是积分更新）
      // 请求方式：GET /api/users/profile
      // 返回数据：{ id, username, points }
      // ==========================================
      const res = await api.get('/users/profile')
      this.userInfo = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    },
    async fetchOrders() {
      // ==========================================
      // 后端接口：获取用户兑换记录
      // 请求方式：GET /api/orders
      // 返回数据：[{ id, productName, costPoints, status, createTime }]
      // ==========================================
      const res = await api.get('/orders')
      this.orders = res.data
    }
  }
}
</script>

<style scoped>
.user-profile { text-align: center; padding: 20px 0; }
.user-profile .points { color: #e6a23c; font-size: 22px; font-weight: bold; }
</style>
