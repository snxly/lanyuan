// pages/dashboard/dashboard.js
import uCharts from '../../lib/u-charts.min.js';
var uChartsInstance = {};

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
            this.drawCharts('trend')
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
  },

  drawCharts(id){
    const data = {
      categories: ["2016","2017","2018","2019","2020","2021"],
      series: [
        {
          name: "目标值",
          data: [35,36,31,33,13,34]
        },
        {
          name: "完成量",
          data: [18,27,21,24,6,28]
        }
      ]
    };
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
        type: "column",
        context: ctx,
        width: 750 / 750 * wx.getSystemInfoSync().windowWidth,
        height: 500 / 750 * wx.getSystemInfoSync().windowWidth,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        padding: [15,15,0,5],
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          data: [{min: 0}]
        },
        extra: {
          column: {
            type: "group"
          }
        }
      });
  },
})