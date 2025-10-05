// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    if (wx.cloud) {
      wx.cloud.init({
        // 替换为你自己的云环境ID
        env: 'prod-0gmg3xtse9cdc95b',
        // 建议开启，方便在云控制台追踪用户
        traceUser: true
      })
    }
  },

  globalData: {
    // 后端API地址
    // apiBaseUrl: 'http://192.168.45.37:3000/api',
    apiBaseUrl: 'http://localhost:3000/api',
    // todo: 微信如何区分线上环境还是测试环境？
    test: false,
  }
})