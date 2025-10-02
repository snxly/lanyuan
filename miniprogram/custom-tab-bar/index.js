// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    color: "#999",
    selectedColor: "#07c160",
    list: [
      {
        pagePath: "/pages/dashboard/dashboard",
        icon: "chart-pie",
        text: "数据"
      },
      {
        pagePath: "/pages/records/records",
        icon: "list",
        text: "记录"
      },
      {
        pagePath: "/pages/profile/profile",
        icon: "user",
        text: "我的"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})