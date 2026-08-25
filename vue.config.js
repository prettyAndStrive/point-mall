const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // 方式1：直接关闭保存时的 lint 检查（最省事，不会再有红线报错）
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/mall-project/api'
        }
      }
    }
  },
  
  // 如果你想保留其他代码规范检查，只针对这一条规则关闭，请注释掉上面的 lintOnSave: false，
  // 并取消下面这段代码的注释：
  /*
  chainWebpack: config => {
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.rules = {
          ...options.rules,
          'vue/multi-word-component-names': 'off' // 方式2：仅关闭多单词组件名规则
        }
        return options
      })
  }
  */
})
