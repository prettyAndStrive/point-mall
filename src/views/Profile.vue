<template>
  <section class="profile-page page-shell">
    <header class="profile-heading"><div><h1 class="page-title">个人中心</h1><p class="page-subtitle">管理账户资料与积分兑换订单</p></div></header>
    <div class="profile-layout">
      <el-card class="profile-card" shadow="never">
        <el-skeleton :loading="profileLoading" animated>
          <template slot="template"><el-skeleton-item variant="rect" class="profile-skeleton" /></template>
          <template>
            <div class="profile-identity"><button class="avatar-button" type="button" title="更换头像" @click="$message.info('头像更换功能即将开放')"><el-avatar :size="92" :src="userInfo.avatarImage" icon="el-icon-user-solid" /></button><h2>{{ userInfo.nickName || userInfo.username }}</h2><p>{{ userInfo.username }}</p><strong>{{ userInfo.points || 0 }}<small>积分</small></strong></div>
            <el-form v-if="editing" :model="form" label-position="top" class="profile-form">
              <el-form-item label="账号"><el-input :value="userInfo.username" disabled /></el-form-item>
              <el-form-item label="昵称" :error="serverErrors.nickName"><el-input v-model.trim="form.nickName" maxlength="20" /></el-form-item>
              <el-form-item label="性别" :error="serverErrors.sex"><el-radio-group v-model="form.sex"><el-radio :label="0">女</el-radio><el-radio :label="1">男</el-radio><el-radio :label="2">保密</el-radio></el-radio-group></el-form-item>
              <el-form-item label="年龄" :error="serverErrors.age"><el-input-number v-model="form.age" :min="1" :max="120" controls-position="right" /></el-form-item>
              <el-form-item label="地址" :error="serverErrors.address"><el-input v-model.trim="form.address" maxlength="255" /></el-form-item>
              <el-form-item label="个人标签" :error="serverErrors.tags"><div class="tag-list"><el-tag v-for="(tag,index) in form.tags" :key="tag" closable @close="removeTag(index)">{{ tag }}</el-tag></div><el-input v-model.trim="tagInput" placeholder="输入标签后按回车添加" @keyup.enter.native="addTag" /></el-form-item>
            </el-form>
            <dl v-else class="profile-details"><div><dt>账号</dt><dd>{{ userInfo.username || '-' }}</dd></div><div><dt>性别</dt><dd>{{ sexText }}</dd></div><div><dt>年龄</dt><dd>{{ userInfo.age || '-' }}</dd></div><div><dt>地址</dt><dd>{{ userInfo.address || '-' }}</dd></div><div><dt>个人标签</dt><dd class="tag-list"><el-tag v-for="tag in userInfo.tags" :key="tag" size="small">{{ tag }}</el-tag><span v-if="!userInfo.tags.length">-</span></dd></div></dl>
            <div class="profile-actions"><el-button v-if="!editing" type="primary" @click="startEdit">修改信息</el-button><template v-else><el-button @click="cancelEdit">取消</el-button><el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button></template></div>
          </template>
        </el-skeleton>
      </el-card>
      <el-card class="orders-card" shadow="never">
        <div class="orders-title"><h2>我的订单</h2><span>{{ orders.length }} 笔</span></div>
        <div class="order-tabs" role="tablist"><button v-for="tab in tabs" :key="tab.value" type="button" :class="['order-tab', { 'is-active': activeTab === tab.value }]" @click="changeTab(tab.value)">{{ tab.label }}</button></div>
        <el-skeleton :loading="ordersLoading" animated>
          <template slot="template"><el-skeleton-item variant="rect" class="orders-skeleton" /></template>
          <template><div v-if="orders.length" class="order-list"><article v-for="order in orders" :key="order.id" class="order-item"><div><p class="order-sn">订单号：{{ order.orderSn || order.id }}</p><p>{{ order.productName || '积分兑换商品' }}</p><time>{{ order.createTime }}</time></div><div class="order-summary"><strong>{{ order.costPoints }} 积分</strong><el-tag size="small" :type="statusType(order.status)">{{ order.status }}</el-tag></div></article></div><el-empty v-else description="暂无相关订单" :image-size="100" /></template>
        </el-skeleton>
      </el-card>
    </div>
  </section>
</template>

<script>
import api from '@/utils/api'
const defaultUser = () => ({ username: '', nickName: '', sex: 2, age: null, address: '', avatarImage: '', tags: [], points: 0 })
export default {
  data() { return { userInfo: defaultUser(), form: defaultUser(), profileLoading: true, ordersLoading: true, saving: false, editing: false, tagInput: '', serverErrors: {}, activeTab: 'all', orders: [], tabs: [{ value: 'all', label: '全部订单' }, { value: 'completed', label: '已完成' }, { value: 'unfinished', label: '未完成' }, { value: 'deleted', label: '已删除' }] } },
  computed: { sexText() { return ({ 0: '女', 1: '男', 2: '保密' })[this.userInfo.sex] || '保密' } },
  created() { this.fetchProfile(); this.fetchOrders() },
  methods: {
    normalizeUser(data) { return { ...defaultUser(), ...data, tags: Array.isArray(data.tags) ? data.tags : [] } },
    async fetchProfile() { this.profileLoading = true; try { const res = await api.get('/user/info'); this.userInfo = this.normalizeUser(res.data); this.form = JSON.parse(JSON.stringify(this.userInfo)); localStorage.setItem('userInfo', JSON.stringify(this.userInfo)) } finally { this.profileLoading = false } },
    async fetchOrders() { this.ordersLoading = true; try { const res = await api.get('/order/list', { params: { status: this.activeTab } }); this.orders = res.data } finally { this.ordersLoading = false } },
    changeTab(tab) { if (this.activeTab !== tab) { this.activeTab = tab; this.fetchOrders() } },
    startEdit() { this.serverErrors = {}; this.form = JSON.parse(JSON.stringify(this.userInfo)); this.editing = true },
    cancelEdit() { this.serverErrors = {}; this.editing = false },
    addTag() { const tag = this.tagInput.trim(); if (!tag) return; if (this.form.tags.includes(tag)) return this.$message.warning('标签已存在'); if (this.form.tags.length >= 10) return this.$message.warning('最多设置10个标签'); this.form.tags.push(tag); this.tagInput = '' },
    removeTag(index) { this.form.tags.splice(index, 1) },
    async saveProfile() { this.serverErrors = {}; this.saving = true; try { const res = await api.post('/user/update', { nickName: this.form.nickName, sex: this.form.sex, age: this.form.age, address: this.form.address, tags: this.form.tags }); this.userInfo = this.normalizeUser(res.data); this.form = JSON.parse(JSON.stringify(this.userInfo)); localStorage.setItem('userInfo', JSON.stringify(this.userInfo)); this.$root.$emit('userInfoUpdated'); this.editing = false; this.$message.success('资料已保存') } catch (error) { this.serverErrors = error.response?.data?.errors || {}; if (!Object.keys(this.serverErrors).length) this.$message.error(error.response?.data?.msg || '保存失败') } finally { this.saving = false } },
    statusType(status) { return status === '已完成' ? 'success' : status === '已取消' ? 'info' : 'warning' }
  }
}
</script>

<style scoped>
.profile-heading{margin-bottom:24px}.profile-layout{display:grid;grid-template-columns:minmax(280px,1fr) minmax(0,2fr);gap:24px;align-items:start}.profile-card,.orders-card{border:1px solid rgba(255,255,255,.8);border-radius:20px;background:rgba(255,255,255,.9);box-shadow:0 10px 30px rgba(17,24,39,.06)}.profile-card ::v-deep .el-card__body,.orders-card ::v-deep .el-card__body{padding:24px}.profile-identity{text-align:center}.avatar-button{padding:3px;border:0;border-radius:50%;background:linear-gradient(135deg,#1677ff,#52c41a);cursor:pointer}.avatar-button ::v-deep .el-avatar{display:block;border:3px solid #fff}.profile-identity h2{margin:12px 0 4px;font-size:22px}.profile-identity p,.profile-details dt,time{color:var(--pm-text-secondary);font-size:13px}.profile-identity strong{display:block;margin-top:12px;color:var(--pm-primary);font-size:28px}.profile-identity small{margin-left:4px;font-size:13px;font-weight:400}.profile-details{margin:24px 0;border-top:1px solid var(--pm-border)}.profile-details>div{display:grid;grid-template-columns:72px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px solid #f1f3f6}.profile-details dt,.profile-details dd{margin:0}.profile-details dd{min-width:0;color:var(--pm-text);word-break:break-word}.profile-form{margin-top:24px}.profile-form ::v-deep .el-form-item{margin-bottom:16px}.tag-list{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.profile-actions{display:flex;gap:10px;margin-top:24px}.profile-actions .el-button{flex:1}.orders-title{display:flex;align-items:center;justify-content:space-between}.orders-title h2{margin:0;font-size:20px}.orders-title span{color:var(--pm-text-secondary);font-size:13px}.order-tabs{display:flex;gap:22px;margin-top:18px;border-bottom:1px solid var(--pm-border);overflow-x:auto}.order-tab{flex:0 0 auto;padding:10px 2px;border:0;border-bottom:3px solid transparent;color:var(--pm-text-secondary);background:transparent;cursor:pointer}.order-tab.is-active{color:var(--pm-primary);border-bottom-color:var(--pm-primary)}.order-list{margin-top:16px}.order-item{display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid #eef0f5}.order-item p{margin:0 0 5px}.order-sn{color:var(--pm-text-secondary);font-size:13px}.order-summary{display:flex;flex:0 0 auto;align-items:flex-end;flex-direction:column;gap:10px}.order-summary strong{color:#e4393c;white-space:nowrap}.profile-skeleton,.orders-skeleton{width:100%;height:360px;border-radius:12px}@media (max-width:900px){.profile-layout{grid-template-columns:1fr}.order-tabs{gap:16px}.profile-card ::v-deep .el-card__body,.orders-card ::v-deep .el-card__body{padding:18px}}
</style>
