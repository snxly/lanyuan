// pages/dashboard/dashboard.js
const app = getApp()

Page({
  data: {
    dashboardData: {
      targetHouseholds: 0,
      totalHouseholds: 0,
      totalAmount: 0,
      dailyGrowth: 0,
      maxDay: { date: '', count: 0, formattedDate: '' },
      minDay: { date: '', count: 0, formattedDate: '' },
      trendData: [],
      dailyData: [],
      recentPayments: [],
      lastUpdate: null,
      progressPercent: '0.0',
      dailyGrowthPercent: '0.0'
    },
    loading: true,
    today: new Date().toISOString().split('T')[0]
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


  viewAllRecords() {
    wx.switchTab({
      url: '/pages/records/records'
    })
  }
})