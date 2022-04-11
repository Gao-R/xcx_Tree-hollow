//index.js
const app = getApp()
wx.cloud.init({
  env:"test-ielpm"
})
Page({
  data: {
    PageFlag: 'home',
  },
  onLoad: function() {},
  NavChange(e){
    this.setData({
      PageFlag:e.currentTarget.dataset.flag
    })
  }
})
