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
      const success = (res) => {
        if (res.data.success) {
          this.setData({
            dashboardData: res.data.data,
            loading: false
          })
          const dailyData = res.data.data.dailyData
          const {dates, dailyCounts, trendCounts} = dailyData
          const totalTrendData = {
            dates: dates,
            counts: [{
              name: '2024',
              data: trendCounts,
            }]
          }
          const dailyTrendData = {
            dates: dates,
            counts: [{
              name: '2024',
              data: dailyCounts,
            }]
          }
          this.drawCharts('trend', 'line', totalTrendData)
          this.drawCharts('daily', 'column', dailyTrendData)
        }
        resolve()
      }
      const fail = (err) => {
        console.error('获取数据失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        })
        reject(err)
      }
      const testMode = app.globalData.test == true
      if (testMode) {
        console.log('=== test mode')
        wx.request({
          url: `${app.globalData.apiBaseUrl}/dashboard`,
          success,
          fail,
        })
      } else {
        console.log('=== prod mode')
        const request = wx.cloud.callContainer({
          "config": {
            "env": "prod-0gmg3xtse9cdc95b"
          },
          "path": "/api/dashboard",
          "header": {
            "X-WX-SERVICE": "lanyuan-backend",
            "content-type": "application/json"
          },
          "method": "GET",
          "data": ""
        })
        request.then((res)=> {
          if (res.data.success) {
            success(res)
          }
        }).catch((err) => {
          fail(err)
        })
      }
    })
  },


  viewAllRecords() {
    wx.switchTab({
      url: '/pages/records/records'
    })
  },

  drawCharts(id, type, data){
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
        type,
        context: ctx,
        width: wx.getWindowInfo().windowWidth - 40,
        height: 300,
        categories: data.dates,
        series: data.counts,
        background: "#FFFFFF",
        padding: [15,15,0,5],
        enableScroll: true,
        xAxis: {
          itemCount: 8,
          rotateLabel: true,
          rotateAngle: 40,
          scrollShow: true,
          disableGrid: true,
          formatter: function(value){
            return value.slice(5)
          }
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

  scrollStart(e) {
    const id = e.currentTarget.id;
    if (uChartsInstance[id]) {
      uChartsInstance[id].scrollStart(e);
    }
  },

  scroll(e) {
    const id = e.currentTarget.id;
    if (uChartsInstance[id]) {
      uChartsInstance[id].scroll(e);
    }
  },

  scrollEnd(e) {
    const id = e.currentTarget.id;
    if (uChartsInstance[id]) {
      uChartsInstance[id].scrollEnd(e);
    }
  },
})