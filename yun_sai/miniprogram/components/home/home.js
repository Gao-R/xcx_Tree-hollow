// components/home/home.js
let count = 0
wx.cloud.init()
let finish = false
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
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
    artcleList: [],
    flag: false
  },
  pageLifetimes: {
    show: async function () {
      finish = false
      count = 0
      this.setData({
        artcleList: []
      })

      await this.getTop()
      // await this.getList()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async getTop() {
      const that = this
      await wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: "gettop",
        }
      }).then((res) => {
        that.setData({
          artcleList: res.result.data,
        })
      }).then(async () => {
        await that.getList()
      })
    },
    async getList() {
      if (finish == true) return ''
      this.setData({
        flag: true
      })
      const that = this
      await wx.cloud.callFunction({
        name: "artcle",
        data: {
          $url: "grtArt",
          skip: count,
        },
        success: (res) => {
          let list = that.data.artcleList.concat(res.result.data)
          count++
          that.setData({
            artcleList: list,
            flag: false
          })
          if (res.result.data.length < 20) {
            finish = true
            return wx.showToast({
              title: '到底了',
              icon: 'none'
            })
          }
        }
      })


    },
    refresh() {
      count = 0
      finish = false
      this.setData({
        artcleList: []
      })
      this.getTop()
      wx.pageScrollTo({
        scrollTop: 0
      })
    },
    top() {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
})