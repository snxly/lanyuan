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
    // apiBaseUrl: 'http://192.168.46.72:3000/api' 
    apiBaseUrl: 'https://lanyuan-backend-190986-4-1381571830.sh.run.tcloudbase.com/api',
    // todo: 微信如何区分线上环境还是测试环境？
    test: false,
  }
})