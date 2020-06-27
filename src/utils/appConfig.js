import wepy from 'wepy'
import {lotusAjax} from './lotusAjax'
import {lotusUtils} from './utils'
// dev apiUrl
let config = {
  versionUrl: 'https://config.xiaoyaozhan.com/api/',
  apiUrl: 'https://demyb.xiaoyaozhan.com/api/',
  imgUrl: 'https://config.xiaoyaozhan.com/images/xyz/',
  Auth: 'https://oauthserver.xiaoyaozhan.com/Oauth2/Token',
  curUrl: 'https://decur.xiaoyaozhan.com/api/', // 积分接口
  xcxImg: 'https://xcximg.xiaoyaozhan.com/', // 保存海报
  xyzImg: 'https://demyb.xiaoyaozhan.com/', // 预览海报
  wss: 'wss://dewss.xiaoyaozhan.com',
  h5Pay: 'http://deh5pay.xiaoyaozhan.com',

  ydUrl: '',
  pageSize: 20,
  systemFlag: 0,
  visible: 1,
  apiRequestFlag: false,
  lotusAppVersion: 'MYBV1.0.0'
}
// 获取动态api
const getApiUrl = () => {
  if (wepy.$appConfig) {
        // 当前环境变量为production获取动态的api url
    if (wepy.$appConfig.curEnv === 'production') {
      return new Promise((resolve, reject) => {
        wx.request({
          url: config.versionUrl + 'Dics/FindDics',
          data: {
            typeCode: `${config.lotusAppVersion}`,
            bigTypeCode: 'Web'
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'GET',
          success: function (response) {
            const res = response.data
                        // 重置config的值  开发时屏蔽
            config.apiUrl = `${res.Data.myb}/api/`
            config.imgUrl = `https://config.xiaoyaozhan.com/images/xyz/`
            config.Auth = `${res.Data.oauth2}/Oauth2/Token`
            config.curUrl = `${res.Data.cur}/api/`
            config.xcxImg = `${res.Data.xcximg}/`
            config.xyzImg = `${res.Data.xyzapi}/`
            config.wss = `wss://${res.Data.wss}`
            config.visible = res.Data.visible
            config.type = res.Data.type
            config.apiRequestFlag = true
            config.msg = `${res.Data.msg}/api/`
            config.express = `${res.Data.express}/express/`
            config.h5Pay = `${res.Data.h5Pay}`
            resolve(config)
          }
        })
      })
    } else {
            // 开发环境配置
      return new Promise((resolve, reject) => {
        config.apiUrl = 'http://demyb.xiaoyaozhan.com/api/'
        config.imgUrl = 'https://config.xiaoyaozhan.com/images/xyz/'
        config.Auth = 'https://oauthserver.xiaoyaozhan.com/Oauth2/Token'
        config.curUrl = 'https://decur.xiaoyaozhan.com/api/'// 积分接口
        config.xcxImg = 'https://xcximg.xiaoyaozhan.com/'// 保存海报
        config.xyzImg = 'https://demyb.xiaoyaozhan.com/'// 预览海报
        config.wss = `wss://dewss.xiaoyaozhan.com`
        config.versionUrl = 'https://config.xiaoyaozhan.com/api/'
        config.express = `https://express.xiaoyaozhan.com/express/`
        config.type = 'yfd'
        config.visible = 1
        config.msg = `http://demsg.xiaoyaozhan.com/api/`
        config.h5Pay = `http://deh5pay.xiaoyaozhan.com`
        resolve(config)
      })
    }
  }
}
// 获取token
const getToken = () => {
    // 加密数据
  const options = lotusUtils.getAesString(`type=yfd&appId=NXP4xanhu72d9ls5boj&appSecret=jv93fsmzt7dq4xa5huo2el6cpwgn18ry&timestamp=${+new Date()}`)
  return new Promise((resolve, reject) => {
    if (!wx.getStorageSync('accessToken')) {
      lotusAjax.fetch('POST', config.Auth, {
        data: {
          p: options
        }
      }).then((response) => {
        const res = response.Data
        if (res) {
          wepy.setStorageSync('accessToken', res.access_token)
                    // wepy.setStorageSync('refreshToken', response.refresh_token);
                    // token过期时间expired为1个小时
          wepy.setStorageSync('tokenExpired', `${+new Date() + 60 * 60 * 1000}`)
          resolve(res.access_token)
        }
      })
    } else {
            // 判断缓存时间是否过期1小时过期
      if (+new Date() > parseInt(wepy.getStorageSync('tokenExpired'))) {
        console.log(`token已失效`)
        try {
          wx.removeStorageSync('accessToken')
          refreshToken().then((response) => {
            resolve(response)
          })
        } catch (e) {
                    // Do something when catch error
        }
      } else {
        resolve(wx.getStorageSync('accessToken'))
      }
    }
  })
}
// 刷新token
const refreshToken = () => {
    // 加密数据
  const options = lotusUtils.getAesString(`type=yfd&appId=NXP4xanhu72d9ls5boj&appSecret=jv93fsmzt7dq4xa5huo2el6cpwgn18ry&timestamp=${+new Date()}`)
  return new Promise((resolve, reject) => {
    lotusAjax.fetch('POST', config.Auth, {
      data: {
        p: options
      }
    }).then((response) => {
      const res = response.Data
      if (res) {
        wepy.setStorageSync('accessToken', res.access_token)
                // token过期时间expired1个小时
        wepy.setStorageSync('tokenExpired', `${+new Date() + 60 * 60 * 1000}`)
        resolve(res.access_token)
      }
    })
  })
}
// 获取code
const getCode = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        if (res.code) {
          return resolve(res.code)
        }
      }
    })
  })
}
// 获取系统设置
const getSetting = () => {
  // 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: function (res) {
                // console.log(res);
        resolve(res)
      }
    })
  })
}
// 打开系统设置
const openSetting = () => {
  return new Promise((resolve, reject) => {
    wx.openSetting({
      success: function (res) {
        console.log(res)
        resolve(res)
      }
    })
  })
}
// 获取授权
const getAuthorize = (type) => {
  const scope = type || 'scope.userInfo'
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: scope,
      success: async function () {
        const res = await getUserInfo()
        resolve(res)
      }
    })
  })
}

export {
    config,
    getToken,
    getApiUrl,
    getCode,
    getSetting,
    openSetting,
    getAuthorize
}
