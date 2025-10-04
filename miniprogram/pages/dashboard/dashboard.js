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
            const dailyData = res.data.data.dailyData
            const {dates, dailyCounts, trendCounts} = dailyData
            const size = 6
            const totalTrendData = {
              dates: dates.slice(0, size),
              counts: [{
                name: '2024',
                data: trendCounts.slice(0,size),
              }]
            }
            const dailyTrendData = {
              dates: dates.slice(0, size),
              counts: [{
                name: '2024',
                data: dailyCounts.slice(0,size),
              }]
            }
            this.drawCharts('trend', 'line', totalTrendData)
            this.drawCharts('daily', 'column', dailyTrendData)
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

  drawCharts(id, type, data){
    // const data = {
    //   categories: ["2016","2017","2018","2019","2020","2021"],
    //   series: [
    //     {
    //       name: "目标值",
    //       data: [35,36,31,33,13,34]
    //     },
    //     // {
    //     //   name: "完成量",
    //     //   data: [18,27,21,24,6,28]
    //     // }
    //   ]
    // };
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
        type,
        context: ctx,
        width: 600 / 750 * wx.getWindowInfo().windowWidth,
        height: 350 / 750 * wx.getWindowInfo().windowWidth,
        categories: data.dates,
        series: data.counts,
        animation: true,
        background: "#FFFFFF",
        // top, right, bottom, left
        padding: [15,15,0,5],
        enableScroll: false,
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          data: [{min: 0}]
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow"
          },
          column: {
            type: "group",
            width: 30,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08
          }
        }
      });
  },
})