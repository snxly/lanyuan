// pages/records/records.js
const app = getApp()

Page({
  data: {
    allPayments: [],
    loading: true,
    currentPage: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.fetchAllRecords()
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreRecords()
    }
  },

  fetchAllRecords() {
    this.setData({ loading: true })

    wx.request({
      url: `${app.globalData.apiBaseUrl}/dashboard`,
      success: (res) => {
        if (res.data.success) {
          // 这里假设后端返回了所有数据，实际项目中可能需要分页接口
          const allPayments = res.data.data.recentPayments || []
          this.setData({
            allPayments: allPayments.slice(0, this.data.pageSize),
            loading: false,
            hasMore: allPayments.length > this.data.pageSize
          })
        }
      },
      fail: (err) => {
        console.error('获取记录失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取记录失败',
          icon: 'none'
        })
      }
    })
  },

  loadMoreRecords() {
    const nextPage = this.data.currentPage + 1
    const startIndex = (nextPage - 1) * this.data.pageSize

    // 模拟加载更多数据
    wx.request({
      url: `${app.globalData.apiBaseUrl}/dashboard`,
      success: (res) => {
        if (res.data.success) {
          const allData = res.data.data.recentPayments || []
          const newPayments = allData.slice(startIndex, startIndex + this.data.pageSize)

          if (newPayments.length > 0) {
            this.setData({
              allPayments: [...this.data.allPayments, ...newPayments],
              currentPage: nextPage,
              hasMore: allData.length > startIndex + this.data.pageSize
            })
          } else {
            this.setData({ hasMore: false })
          }
        }
      }
    })
  },

  isToday(dateStr) {
    const today = new Date().toISOString().split('T')[0]
    return dateStr.startsWith(today)
  }
})