// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false
  },

  onLoad() {
    // 可以在这里获取用户信息
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  contactService() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  },

  aboutApp() {
    wx.showModal({
      title: '关于',
      content: '供暖缴费数据看板 v1.0.0\n实时监控小区供暖缴费进度',
      showCancel: false
    })
  }
})