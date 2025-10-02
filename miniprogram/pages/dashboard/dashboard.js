// pages/dashboard/dashboard.js
const app = getApp()

Page({
  data: {
    dashboardData: {
      totalHouseholds: 0,
      totalAmount: 0,
      dailyGrowth: 0,
      maxDay: { date: '', count: 0 },
      minDay: { date: '', count: 0 },
      trendData: [],
      dailyData: [],
      recentPayments: [],
      lastUpdate: null
    },
    loading: true
  },

  onLoad() {
    this.fetchDashboardData()
  },

  onPullDownRefresh() {
    this.fetchDashboardData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  fetchDashboardData() {
    this.setData({ loading: true })

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.apiBaseUrl}/dashboard`,
        success: (res) => {
          if (res.data.success) {
            this.setData({
              dashboardData: res.data.data,
              loading: false
            })
          }
          resolve()
        },
        fail: (err) => {
          console.error('获取数据失败:', err)
          this.setData({ loading: false })
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  },

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatAmount(amount) {
    return (amount / 10000).toFixed(0) + '万'
  },

  formatDate(dateStr) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  isToday(dateStr) {
    const today = new Date().toISOString().split('T')[0]
    return dateStr.startsWith(today)
  }
})