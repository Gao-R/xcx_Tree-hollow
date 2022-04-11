// components/mine/mine.js
wx.cloud.init()
let app = getApp(),
  openid = app.globalData.openId,
  page = 0,
  finish = false,
  administration = false
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
    head_img: wx.getStorageSync('head_img'),
    head_name: wx.getStorageSync('head_name') || '',
    atrList: [],
    flag: false,
    adm: false
  },
  pageLifetimes: {
    show: async function () {
      finish = false
      page = 0
      this.setData({
        atrList: []
      })
      if (this.data.head_img == '') {
        this.changeHeadImg()
      }
      await this.getTop()
      await this.getList()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async getAdministration(openids) {
      return await wx.cloud.callFunction({
        name: 'artcle',
        data: {
          $url: 'getAdm'
        }
      }).then((res) => {
        let flag =  res.result.data.map((val) => {
          if (val.openid.indexOf(openids) != -1) {
            return true
          }
        })
        return flag[0]
      })
    },
    changeHeadImg() {
      wx.request({
        url: `https://api.muxiaoguo.cn/api/sjtx?method=mobile`,
        success: (res) => {
          this.setData({
            head_img: res.data.data.imgurl
          })
          wx.setStorageSync('head_img', res.data.data.imgurl)
        }
      })
    },
    changeName(e) {
      if (e.detail.value.trim() == '') return wx.showToast({
        title: '输入为空',
        icon: 'none'
      })
      this.setData({
        head_name: e.detail.value
      })
      wx.setStorageSync('head_name', e.detail.value)

    },
    async getTop() {
      let that = this
      await wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: "gettop",
        },
        success(res) {
          that.setData({
            atrList: res.result.data,
          })
        },
        fail(err) {
          wx.showToast({
            title: '加载置顶失败',
            icon: 'none'
          })
        }
      })
    },
    async getOpenid() {
      await wx.cloud.callFunction({
        name: "openid",
      }).then(async (res) => {
        app.changeKey('openId', res.result.openid)
        openid = res.result.openid
      })
    },
    async getList() {
      if (finish == true) return wx.showToast({
        title: '已加载全部',
        icon: 'success'
      })
      this.setData({
        flag: true
      })
      let url = 'getUserAct'
      if (openid === "") {
        this.getOpenid()
      }
      if (await this.getAdministration(openid)) {
        this.setData({
          adm: true
        })
        url = 'grtArt'
      }
      let that = this
      await wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: url,
          openid: openid,
          skip: page
        },
        success(res) {
          page++
          that.setData({
            atrList: that.data.atrList.concat(res.result.data),
            flag: false
          })
          if (res.result.data.length < 20) {
            finish = true
            return wx.showToast({
              title: '已加载全部',
              icon: 'none'
            })
          }
        },
        fail(err) {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
    },
    delete(e) {
      wx.showLoading({
        title: '加载中',
      })
      let that = this
      wx.cloud.callFunction({
        name: 'artcle',
        data: {
          $url: "removeArt",
          artId: e.target.dataset.id
        },
        success(res) {
          that.refresh()
          wx.hideLoading()
          wx.showToast({
            title: '删除成功',
            icon: "success"
          })
        },
        fail(err) {
          console.error(err);
          wx.showToast({
            title: '删除失败',
            icon: "none"
          })

        }
      })
    },
    async refresh() {
      // wx.showLoading({
      //   title: '加载中',
      // })
      finish = false
      page = 0
      this.setData({
        flag: false,
        atrList: []
      })
      await this.getTop()
      await this.getList()
      wx.pageScrollTo({
        scrollTop: 0
      })
      // wx.hideLoading()
    },
    top() {
      wx.pageScrollTo({
        scrollTop: 0
      })
    },
    async setTop(e) {

      let that = this
      await wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: "changetop",
          artId: e.target.dataset.id,
          status: e.target.dataset.status
        },
        success(res) {
          that.refresh()
          wx.showToast({
            title: '设置置顶成功',
            icon: 'success'
          })
        },
        fail(err) {
          wx.showToast({
            title: '设置置顶失败',
            icon: 'none'
          })
        }
      })
    },
    // ListTouch触摸开始
    ListTouchStart(e) {
      this.setData({
        ListTouchStart: e.touches[0].pageX
      })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
      this.setData({
        ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
      })
    },

    // ListTouch计算滚动
    ListTouchEnd(e) {
      if (this.data.ListTouchDirection == 'left') {
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      } else {
        this.setData({
          modalName: null
        })
      }
      this.setData({
        ListTouchDirection: null
      })
    },
  },
})