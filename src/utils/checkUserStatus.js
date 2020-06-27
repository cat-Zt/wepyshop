import wepy from 'wepy'
import {config, getApiUrl, getToken, getCode, getSetting} from './appConfig'
import {lotusAjax} from './lotusAjax'

// 获取是否授权
const getIsAuthor = async () => {
    // 是否授权
  let setTing = await getSetting()
    // 授过权-->用户授权结果authSetting
  if (setTing.authSetting['scope.userInfo']) {
    if (wx.getStorageSync('wxUserInfo')) {
      const Result = JSON.parse(wepy.getStorageSync('wxUserInfo'))
            // 授权过的返回code为1并返回用户信息
      return new Promise((resolve, reject) => {
        resolve({
          Code: 1,
          Message: '授权过',
          Result
        })
      })
    } else {
            // 旧用户授权过但没有获取的微信用户信息
      return new Promise((resolve, reject) => {
        resolve({
          Code: 1,
          Message: '授权过2'
        })
      })
    }
  } else if (setTing.authSetting['scope.userInfo'] === false) {
        // 拒绝授权
    console.log(`需要用户重新授权`)
    return new Promise((resolve, reject) => {
      resolve({
        Code: 0,
        Message: '需要用户重新授权'
      })
    })
  } else {
        // 首次授权
    return new Promise((resolve, reject) => {
      resolve({
        Code: -1,
        Message: '首次授权'
      })
    })
  }
}
// 登录
const userLoginByCode = async () => {
  let Code = await getCode()
  return lotusAjax.fetch('POST', config.apiUrl + 'Login/LoginByCode', {
    data: {
      Code: Code,
      hideLoading: true
    }
  }).then((response) => {
    const result = response.Data
        // 有用户信息
    if (result) {
      const userDataMsg = JSON.stringify(result)
      wepy.setStorageSync('userDataMsg', userDataMsg)
      wepy.setStorageSync('wxDetailCode', result.WxDetailCode)
      return result
    } else {

    }
  })
}
// 获取code
// const CheckSession = async () => {
//   return new Promise((resolve, reject) => {
//     wx.checkSession({
//       success: function() {
//                 // session_key 未过期，并且在本生命周期一直有效
//         console.log('未过期，并且在本生命周期一直有效')
//         return resolve(true)
//       },
//       fail: function() {
//                 // 失败重新获取
//         console.log('失败重新获取')
//         return resolve(false)
//       }
//     })
//   })
// }

const checkUserRegister = async (loadPageRoute, options, isJump = true, callback) => {
    // loadPageRoute,options=>loadPageRoute着陆页路由，options着陆页option
    // 获取授权信息
  const isAuthorMsg = await getIsAuthor()
  console.log(isAuthorMsg, loadPageRoute, wepy.$appConfig)
    // 缓存需要返回的路由
  if (loadPageRoute) {
    if (isAuthorMsg) {
        // 授权过删除缓存route
      if (isAuthorMsg.Code === 1) {
        if (wepy.getStorageSync('loadPageRoute')) {
          wepy.removeStorageSync('loadPageRoute')
        }
      } else {
                // 首次着陆缓存route
        wepy.setStorageSync('loadPageRoute', loadPageRoute)
      }
    }
  }
  if (wepy.$appConfig) {
    // 切换生产时替换 url
    const env = wepy.$appConfig.curEnv
    if (env) {
            // 发布环境获取动态api url
      if (!config.apiRequestFlag) {
        if (!wx.getStorageSync('lotusAppVersion')) {
          wx.setStorageSync('lotusAppVersion', config.lotusAppVersion)
        }
        await getApiUrl()
      }
    }
    // 版本比对不一致删除所有缓存信息
    if (wx.getStorageSync('lotusAppVersion')) {
      if (config.lotusAppVersion !== wx.getStorageSync('lotusAppVersion')) {
        try {
          wx.clearStorageSync()
        } catch (error) {
          console.log(error)
        }
      }
    }
    // 获取token
    // console.log('getToken');
    // await getToken();
    if (!wx.getStorageSync('userDataMsg')) {
      if (isAuthorMsg) {
        // 首次授权
        if (isAuthorMsg.Code === -1 || isAuthorMsg.Code === 0) {
                    // 拼接url参数传入到授权页面
          let str = ''
          const dataOption = options
          for (let itemKey in dataOption) {
            str += `${itemKey}=${dataOption[itemKey]}&`
          }
          // 跳转授权页
          console.log('str', str, options, isJump)
          if (isJump) {
            wepy.reLaunch({
              url: `/pages/authorize/authorize?${str}`
            })
          }
          return {
            Code: -1
          }
        }
                // 授权过
        if (isAuthorMsg.Code === 1) {
          console.log('用户登录:userLoginByCode')
                    // const userData = await userLoginByCode();
                    // 获取code
          return await userLoginByCode()
        }
      }
    } else {
            // 已注册
      console.log('已注册:')
      return new Promise((resolve, reject) => {
        const result = JSON.parse(wx.getStorageSync('userDataMsg'))
        resolve(result)
      })
    }
  }
}

export {
    checkUserRegister
}
