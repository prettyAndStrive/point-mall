<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>积分商城 - 注册</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerForm">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" prefix-icon="el-icon-message" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="handleRegister" :loading="loading">注册</el-button>
        <p class="link-text">已有账号？<router-link to="/login">去登录</router-link></p>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      registerForm: { username: '', password: '', email: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            // ==========================================
            // 后端接口：用户注册
            // 请求方式：POST /api/auth/register
            // 请求参数：{ username, password, email }
            // 返回数据：{ message: "注册成功" }
            // ==========================================
            await api.post('/auth/register', this.registerForm)
            
            this.$message.success('注册成功，请登录')
            this.$router.push('/login')
          } catch (error) {
            console.error('注册失败', error)
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
/* 复用Login的样式 */
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }
.login-card { width: 400px; }
.link-text { text-align: center; margin-top: 15px; font-size: 14px; }
</style>
