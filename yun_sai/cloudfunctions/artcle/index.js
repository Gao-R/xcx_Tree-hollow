// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

cloud.init()

let num = 20

// 云函数入口函数
// "openid":"aa",
// "name":"aa",
// "head_img":"sadsad",
// "date_time":"sadasd",
// "content":"xcxc"
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  });
  app.use(async (ctx, next) => {
    await next()
  })
  app.router('legal', async (ctx, next) => {
    try {
      const res = await cloud.openapi.security.msgSecCheck({
      content:event.content
      })
      return ctx.body = res;
      } catch (err) {
      return ctx.body = err;
      }
  })

  // 添加文章
  app.router('addArt', async (ctx, next) => {
    ctx.body = await cloud.database().collection('artcle').add({
      data: {
        openid: event.openid,
        name: event.name,
        head_img: event.head_img,
        date_time: event.date_time,
        content: event.content,
        top: false
      },
      success: (res) => {
        return res.data
      }
    })
  })
  // 查询用户文章
  app.router('getUserAct', async (ctx, next) => {
    let skipNum = event.skip * num
    ctx.body = await cloud.database().collection('artcle').orderBy('date_time', 'desc').skip(skipNum).limit(num).where({
      openid: event.openid,
      top: false
    }).get({
      success: (res) => {
        return res.data
      }
    })
  })
  // 删除用户文章
  app.router('removeArt', async (ctx, body) => {
    ctx.body = await cloud.database().collection('artcle').where({
      _id: event.artId
    }).remove({
      success: (res) => {
        return res.data
      }
    })
  })
  // 查询所有文章
  app.router('grtArt', async (ctx, next) => {
    let skipNum = event.skip * num
    ctx.body = await cloud.database().collection('artcle').where({
      top: false
    }).orderBy('date_time', 'desc').skip(skipNum).limit(num).get({
      success: (res) => {
        return res.data
      }
    })
  })
  // 获取置顶·
  app.router('gettop', async (ctx, next) => {
    ctx.body = await cloud.database().collection('artcle').orderBy('date_time', 'desc').where({
      top: true
    }).get({
      success: (res) => {
        return res.data
      }
    })
  })
  // 更改置顶
  app.router('changetop', async (ctx, next) => {
    ctx.body = await cloud.database().collection('artcle').where({
      _id: event.artId
    }).update({
      data: {
        top: event.status
      }
    })
  })
  // 获取管理员
  app.router('getAdm', async (ctx, next) => {
    ctx.body = await cloud.database().collection('administration').get({
      success:(res) => {
        return res.data
      }
    })
  })
  return app.serve();
}