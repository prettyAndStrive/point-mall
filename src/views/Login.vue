<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>积分商城 - 登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="handleLogin" :loading="loading">登录</el-button>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 渐变背景 */
}

.login-card {
  width: 400px;
  border-radius: 15px; /* 加大圆角 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); /* 增加立体阴影 */
  background-color: rgba(255, 255, 255, 0.9); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 毛玻璃模糊效果 */
  border: none; /* 去掉 ElementUI 默认的灰色边框 */
  overflow: hidden; /* 防止圆角被内部元素撑破 */
}

/* 使用深度选择器，强制修改 ElementUI 卡片内部主体的样式 */
.login-card ::v-deep .el-card__body {
  padding: 30px 40px; /* 调整内部表单的间距，让表单不那么贴边 */
}

.link-text { 
  text-align: center; 
  margin-top: 15px; 
  font-size: 14px; 
}
</style>

