<template>
  <div class="login-container">
    <div class="auth-orb auth-orb-one"></div><div class="auth-orb auth-orb-two"></div>

    <!-- 仅在 qinying 登录成功后展示；动画结束后会自动进入商城首页。 -->
    <section
      v-if="showConfession"
      class="confession-layer"
      :class="{ 'is-fading': isConfessionFading }"
      aria-live="polite"
      aria-label="给 qinying 的表白"
    >
      <div class="confession-glow confession-glow-one"></div>
      <div class="confession-glow confession-glow-two"></div>
      <div class="confession-petals" aria-hidden="true">
        <span v-for="petal in petals" :key="petal.id" class="petal" :style="petal.style">♥</span>
      </div>
      <div class="confession-stars" aria-hidden="true">
        <span v-for="star in stars" :key="star.id" class="star" :style="star.style">✦</span>
      </div>

      <article class="confession-card">
        <div class="heart heart-left" aria-hidden="true">♥</div>
        <div class="heart heart-right" aria-hidden="true">♥</div>
        <p class="confession-kicker">A little message for you</p>
        <h1>老婆，我爱你</h1>
        <div class="confession-divider"><span>♥</span></div>
        <p class="confession-message">谢谢你成为我生命里最温柔的光。柴米油盐里有你的细心与陪伴，平凡的每一天都因你而闪闪发亮。未来的路还很长，我想牵着你的手，把爱和偏爱都给你。</p>
        <p class="confession-signature">往后余生，仍想和你一起看每一次日出日落</p>
        <button class="confession-skip" type="button" @click="finishConfession">跳过</button>
      </article>
    </section>

    <el-card class="login-card" shadow="never">
      <div class="auth-brand"><span class="brand-mark"><i class="el-icon-present"></i></span><div><h2>颖宝儿的积分商城</h2></div></div>
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
      loading: false,
      showConfession: false,
      isConfessionFading: false,
      confessionTimer: null,
      confessionEndTimer: null,
      // 固定生成少量装饰元素，避免持续创建 DOM 影响动画流畅度。
      petals: Array.from({ length: 18 }, (_, index) => ({
        id: `petal-${index}`,
        style: {
          left: `${(index * 17 + 4) % 100}%`,
          animationDelay: `${-(index * 0.72)}s`,
          animationDuration: `${8 + (index % 5)}s`,
          fontSize: `${13 + (index % 4) * 4}px`
        }
      })),
      stars: Array.from({ length: 16 }, (_, index) => ({
        id: `star-${index}`,
        style: {
          left: `${(index * 23 + 7) % 100}%`,
          top: `${(index * 31 + 8) % 82}%`,
          animationDelay: `${-(index * 0.38)}s`,
          animationDuration: `${1.8 + (index % 4) * 0.45}s`
        }
      }))
    }
  },
  beforeDestroy() {
    clearTimeout(this.confessionTimer)
    clearTimeout(this.confessionEndTimer)
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
            this.$root.$emit('userInfoUpdated')

            // 表白只由本次登录输入的用户名触发，避免昵称等展示字段干扰判断。
            if (this.loginForm.username.trim() === 'qinying') {
              this.startConfession()
            } else {
              this.$router.push('/')
            }
          } catch (error) {
            console.error('登录失败', error)
          } finally {
            this.loading = false
          }
        }
      })
    },
    startConfession() {
      this.showConfession = true
      this.isConfessionFading = false
      clearTimeout(this.confessionTimer)
      clearTimeout(this.confessionEndTimer)

      // 保持完整展示 10 秒，再用 1.5 秒淡出。
      this.confessionTimer = setTimeout(() => {
        this.isConfessionFading = true
        this.confessionEndTimer = setTimeout(this.finishConfession, 1500)
      }, 10000)
    },
    finishConfession() {
      clearTimeout(this.confessionTimer)
      clearTimeout(this.confessionEndTimer)
      this.showConfession = false
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.login-container { position: relative; display: flex; min-height: 100vh; padding: 24px; overflow: hidden; align-items: center; justify-content: center; background: radial-gradient(circle at 10% 15%, #e1f0ff 0, transparent 32%), linear-gradient(135deg, #eef6ff 0%, #f8fbff 50%, #e6f1ff 100%); }
.login-card { position: relative; z-index: 1; width: min(100%, 440px); border: 1px solid rgba(255, 255, 255, .85); border-radius: var(--pm-radius-lg); box-shadow: 0 22px 60px rgba(22, 79, 152, .16); background-color: rgba(255, 255, 255, .86); backdrop-filter: blur(18px); }
.login-card ::v-deep .el-card__body { padding: 40px; }
.auth-brand { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 32px; }.brand-mark { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; color: #fff; background: linear-gradient(135deg, var(--pm-primary), #69a8ff); box-shadow: 0 8px 20px rgba(22, 119, 255, .25); font-size: 22px; }.auth-brand h2 { margin: 0; color: var(--pm-text); font-size: 24px; }.auth-brand p { margin: 3px 0 0; color: var(--pm-text-secondary); font-size: 13px; }
.login-card ::v-deep .el-form-item { margin-bottom: 22px; }.login-card ::v-deep .el-input__inner { height: 44px; }.auth-submit { width: 100%; height: 44px; font-size: 16px; }.link-text { margin: 20px 0 0; color: var(--pm-text-secondary); text-align: center; font-size: 14px; }
.auth-orb { position: absolute; width: 340px; height: 340px; border-radius: 50%; filter: blur(4px); opacity: .55; }.auth-orb-one { top: -170px; right: 8%; background: #a3d3ff; }.auth-orb-two { bottom: -190px; left: 4%; background: #c6ddff; }
.confession-layer { position: absolute; z-index: 10; inset: 0; display: grid; overflow: hidden; place-items: center; isolation: isolate; background: radial-gradient(circle at 50% 25%, rgba(255, 235, 243, .9), transparent 37%), linear-gradient(135deg, rgba(255, 247, 251, .98), rgba(255, 226, 237, .96)); opacity: 1; transition: opacity 1.5s ease; }
.confession-layer.is-fading { opacity: 0; pointer-events: none; }
.confession-glow { position: absolute; z-index: -1; width: 42vmax; height: 42vmax; border-radius: 50%; filter: blur(15px); opacity: .5; animation: glow-drift 8s ease-in-out infinite alternate; }.confession-glow-one { top: -22vmax; left: -10vmax; background: #ff9fbe; }.confession-glow-two { right: -12vmax; bottom: -24vmax; background: #d9a8ff; animation-delay: -4s; }
.confession-card { position: relative; width: min(88vw, 600px); padding: clamp(38px, 7vw, 70px) clamp(28px, 7vw, 72px); border: 1px solid rgba(255, 255, 255, .82); border-radius: 30px; background: rgba(255, 255, 255, .62); box-shadow: 0 24px 70px rgba(167, 55, 94, .2); text-align: center; backdrop-filter: blur(18px); animation: confession-rise .9s cubic-bezier(.2, .8, .2, 1) both; }
.confession-kicker { margin: 0 0 12px; color: #b9718a; font-family: Georgia, serif; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }.confession-card h1 { margin: 0; color: #d8436b; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(30px, 6vw, 48px); font-weight: 500; letter-spacing: .04em; }.confession-divider { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 22px 0; color: #ee7d9d; }.confession-divider::before, .confession-divider::after { width: 58px; height: 1px; background: linear-gradient(90deg, transparent, #ef9ab0); content: ''; }.confession-divider::after { transform: scaleX(-1); }.confession-message { margin: 0; color: #7c4557; font-family: Georgia, 'Microsoft YaHei', serif; font-size: clamp(16px, 2.5vw, 19px); line-height: 2; letter-spacing: .04em; }.confession-signature { margin: 27px 0 0; color: #ba7288; font-size: 14px; letter-spacing: .09em; }.confession-skip { margin-top: 26px; padding: 7px 17px; border: 0; border-radius: 99px; color: #b57286; background: rgba(255, 255, 255, .55); cursor: pointer; font: inherit; font-size: 12px; transition: background .2s, transform .2s; }.confession-skip:hover { background: rgba(255, 255, 255, .9); transform: translateY(-1px); }
.heart { position: absolute; color: #f080a0; filter: drop-shadow(0 3px 5px rgba(213, 64, 106, .18)); animation: heart-beat 1.8s ease-in-out infinite; }.heart-left { top: 24px; left: 32px; font-size: 25px; }.heart-right { right: 31px; bottom: 23px; font-size: 31px; animation-delay: -.7s; }.petal { position: absolute; top: -40px; color: rgba(231, 88, 137, .72); user-select: none; animation-name: petal-fall; animation-timing-function: linear; animation-iteration-count: infinite; }.star { position: absolute; color: rgba(255, 255, 255, .92); text-shadow: 0 0 10px rgba(251, 107, 158, .65); animation: twinkle ease-in-out infinite alternate; }
@keyframes confession-rise { from { opacity: 0; transform: translateY(35px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes petal-fall { from { transform: translate3d(0, -6vh, 0) rotate(0deg); } to { transform: translate3d(7vw, 112vh, 0) rotate(300deg); } } @keyframes twinkle { from { opacity: .2; transform: scale(.7); } to { opacity: 1; transform: scale(1.25); } } @keyframes heart-beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } } @keyframes glow-drift { from { transform: translate3d(-3%, -2%, 0) scale(.92); } to { transform: translate3d(5%, 4%, 0) scale(1.08); } }
@media (prefers-reduced-motion: reduce) { .confession-card, .confession-glow, .petal, .star, .heart { animation: none; } .confession-layer { transition-duration: .3s; } }
@media (max-width: 480px) { .login-container { padding: 16px; }.login-card ::v-deep .el-card__body { padding: 28px 24px; } }
</style>
