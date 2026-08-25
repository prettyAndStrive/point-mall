<template>
  <div class="login-container">
    <div class="auth-orb auth-orb-one"></div><div class="auth-orb auth-orb-two"></div>
    <el-card class="login-card" shadow="never">
      <div class="auth-brand"><span class="brand-mark"><i class="el-icon-present"></i></span><div><h2>欢迎回来</h2><p>登录 PointMall，兑换心仪好物</p></div></div>
      <el-form :model="loginForm" :rules="rules" ref="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-button type="primary" class="auth-submit" @click="handleLogin" :loading="loading">登录</el-button>
        <p class="link-text">还没有账号？<router-link to="/register">立即注册</router-link></p>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      loginForm: { username: '', password: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            // ==========================================
            // 后端接口：用户登录
            // 请求方式：POST /api/auth/login
            // 请求参数：{ username, password }
            // 返回数据：{ token, userInfo }
            // ==========================================
            const res = await api.post('/auth/login', this.loginForm)
            
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
            this.$message.success('登录成功')
            this.$router.push('/')
            this.$root.$emit('userInfoUpdated') // 新增这行
          } catch (error) {
            console.error('登录失败', error)
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container { position: relative; display: flex; min-height: 100vh; padding: 24px; overflow: hidden; align-items: center; justify-content: center; background: radial-gradient(circle at 10% 15%, #e1f0ff 0, transparent 32%), linear-gradient(135deg, #eef6ff 0%, #f8fbff 50%, #e6f1ff 100%); }
.login-card { position: relative; z-index: 1; width: min(100%, 440px); border: 1px solid rgba(255, 255, 255, .85); border-radius: var(--pm-radius-lg); box-shadow: 0 22px 60px rgba(22, 79, 152, .16); background-color: rgba(255, 255, 255, .86); backdrop-filter: blur(18px); }
.login-card ::v-deep .el-card__body { padding: 40px; }
.auth-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }.brand-mark { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; color: #fff; background: linear-gradient(135deg, var(--pm-primary), #69a8ff); box-shadow: 0 8px 20px rgba(22, 119, 255, .25); font-size: 22px; }.auth-brand h2 { margin: 0; color: var(--pm-text); font-size: 24px; }.auth-brand p { margin: 3px 0 0; color: var(--pm-text-secondary); font-size: 13px; }
.login-card ::v-deep .el-form-item { margin-bottom: 22px; }.login-card ::v-deep .el-input__inner { height: 44px; }.auth-submit { width: 100%; height: 44px; font-size: 16px; }.link-text { margin: 20px 0 0; color: var(--pm-text-secondary); text-align: center; font-size: 14px; }
.auth-orb { position: absolute; width: 340px; height: 340px; border-radius: 50%; filter: blur(4px); opacity: .55; }.auth-orb-one { top: -170px; right: 8%; background: #a3d3ff; }.auth-orb-two { bottom: -190px; left: 4%; background: #c6ddff; }
@media (max-width: 480px) { .login-container { padding: 16px; }.login-card ::v-deep .el-card__body { padding: 28px 24px; } }
</style>

