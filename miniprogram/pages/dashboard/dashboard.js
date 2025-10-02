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
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  isToday(dateStr) {
    if (!dateStr) return false
    const today = new Date().toISOString().split('T')[0]
    return dateStr.startsWith(today)
  },

  // 计算进度百分比
  getProgressPercent() {
    const households = this.data.dashboardData.totalHouseholds || 0
    const percent = (households / 2000) * 100
    return Math.min(percent, 100).toFixed(1)
  },

  // 计算日增长百分比
  getDailyGrowthPercent() {
    const growth = this.data.dashboardData.dailyGrowth || 0
    const total = this.data.dashboardData.totalHouseholds || 1
    const percent = (Math.abs(growth) / total) * 100
    return percent.toFixed(1)
  },

  viewAllRecords() {
    wx.switchTab({
      url: '/pages/records/records'
    })
  }
})