// components/published/published.js
const app = getApp()
wx.cloud.init()

Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    isHidden: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    rules: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeRules() {
      this.setData({
        rules: !this.data.rules
      })
    },
    release(e) {
      let content = e.detail.value.content
      if (wx.getStorageSync('head_name').trim() == '') return wx.showModal({
        content: "请到我的页面设置名字",
        showCancel: false
      })
      if (this.data.rules == false) return wx.showModal({
        content: "请仔细阅读发布功能规则",
        showCancel: false
      })

      if (content.trim() == "") return wx.showModal({
        content: "内容为空",
        showCancel: false
      })

      wx.showLoading({
        title: '加载中',
      })
      this.legal(content)
    },
    legal(content) {
      let that = this
      wx.cloud.callFunction({
        name: 'artcle',
        data: {
          $url: "legal",
          content: content
        },
        success(res) {
          if (res.result.errCode === 87014) {
            wx.hideLoading()
            wx.showToast({
              title: '内容不合法',
              icon: "none"
            })
          } else if (res.result.errCode === 0) {
            wx.showToast({
              title: '内容检测完毕',
              icon: "success"
            })
            that.upload(content)
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '内容检测失败',
              icon: "none"
            })
          }
        },
        fail(er) {
          wx.hideLoading()
          wx.showToast({
            title: '内容检测失败',
            icon: "none"
          })
        }
      })
    },
    upload(content) {
      wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: "addArt",
          name: wx.getStorageSync('head_name'),
          head_img: wx.getStorageSync('head_img'),
          date_time: new Date(),
          content: content,
          openid: app.globalData.openId
        },
        success: (res) => {
          wx.hideLoading()
          if (res.errMsg !== "cloud.callFunction:ok") {
            wx.showToast({
              title: '发布失败',
              icon: "none"
            })
          } else {
            wx.showToast({
              title: '发布成功',
            })
          }
        },
        fail: (err) => {
          wx.hideLoading()
          console.error(err);
          wx.showToast({
            title: '发布失败',
            icon: "none"
          })
        }
      })
    }
  }
})