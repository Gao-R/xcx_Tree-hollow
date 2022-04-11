//app.js
App({
  onLaunch: function () {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
		if (capsule) {
		 	this.globalData.Custom = capsule;
			this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
		} else {
			this.globalData.CustomBar = e.statusBarHeight + 50;
		}
      }
    })
  },
  globalData:{
    // head_img:wx.getStorageSync('head_img') || '',
    // head_name:wx.getStorageSync('head_name') || '',
    openId:""
  },
  changeKey(key,value){
    this.globalData[key] = value
  }
})
