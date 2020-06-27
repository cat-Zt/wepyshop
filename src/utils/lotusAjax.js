import wepy from 'wepy'
// api接口请求url统计数组
let requestUrlArr = []
// 统计不需要显示loading标识
let loadingFlag = []
// 获取用户手机系统配置
const getUserSystem = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: function (res) {
        const obj = {
          brand: res.brand, // 手机品牌
          model: res.model, // 手机型号
          version: res.version, // 微信版本号
          system: res.system, // 操作系统版本
          platform: res.platform, // 客户端平台
          SDKVersion: res.SDKVersion // 客户端基础库版本
        }
        resolve(obj)
      }
    })
  })
}
// get or post 请求封装
const lotusAjax = {
  get: (url, options) => {
    let accessToken = wx.getStorageSync('accessToken')
    return getUserSystem().then((systemRes) => {
      // console.log(systemRes);
      if (!options.data.hideLoading && !requestUrlArr.length) {
        wepy.showLoading({
          title: options.message || '加载中',
          mask: true
        })
      }
      requestUrlArr.push(url)
      return new Promise((resolve, reject) => {
        wepy.request({
          url: url,
          data: options.data || {},
          header: {
            'content-type': options.contentType || 'application/x-www-form-urlencoded',
            // 'Authorization': `Bearer ${accessToken}`,
            // 'Authorization': `Bearer eeHNyiKVVjsY8LtwNTFLej8FhGlfSP-d-u16NkTdNfpbHVAkwIBpRJjZ1gb9nPPctjoOmOVGWzbaFedf9_tlq2rnQlsd-WLkhr-FuDzBFDO9Lb94eeqJdG8RZM8-G5hkcmTmitzJ5ezWkiS1Ij_UJ4Epblaoq-VHS02Scop3l4YtlZ3D3dRkvuIvZq0i9m3tZzCOiRsUcY6l2VrSRpXwMKsYc9xUbkAIjTxgeIwG-MJvAd4o95MfCdxVAbJlayLrEBOrhQ`,
            'sMsg': JSON.stringify(systemRes)
          },
          method: 'GET',
          success: function (res) {
            const result = res.data
            if (res.statusCode === 200 || res.statusCode === 304) {
              resolve(result)
            } else {
              // 捕获错误信息
              if (res.data.Error) {
                const errorMsg = res.data.Error.Message
                wepy.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 2000
                })
                resolve(result)
              } else {
                wepy.showToast({
                  title: '网络异常',
                  icon: 'none'
                })
              }
            }
          },
          fail: function (res) {
            wepy.hideLoading()
          },
          complete: function () {
            // 请求完成清除当前url
            requestUrlArr.map((item, index) => {
              if (item === url) {
                requestUrlArr.splice(index, 1)
              }
            })
            // 请求api数组为空隐藏加载中弹层重置数组
            if (!requestUrlArr.length) {
              wepy.hideLoading()
              requestUrlArr = []
            }
          }
        })
      })
    })
  },
  post: (url, options) => {
    let accessToken = wx.getStorageSync('accessToken')
    return getUserSystem().then((systemRes) => {
      // console.log(systemRes);
      if (!options.data.hideLoading && !requestUrlArr.length) {
        wepy.showLoading({
          title: options.message || '加载中',
          mask: true
        })
      }
      requestUrlArr.push(url)
      return new Promise((resolve, reject) => {
        wepy.request({
          url: url,
          data: options.data || {},
          header: {
            'content-type': options.contentType || 'application/x-www-form-urlencoded',
            // 'Authorization': `Bearer ${accessToken}`,
            'sMsg': JSON.stringify(systemRes)
          },
          method: 'POST',
          success: function (res) {
            const result = res.data
            if (res.statusCode === 200 || res.statusCode === 304) {
              resolve(result)
            } else {
              // 捕获错误信息
              if (res.data.Error) {
                const errorMsg = res.data.Error.Message
                wepy.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 2000
                })
                resolve(result)
              } else {
                wepy.showToast({
                  title: '网络异常',
                  icon: 'none'
                })
              }
            }
          },
          fail: function () {
            wepy.hideLoading()
          },
          complete: function () {
            // 请求完成清除当前url
            requestUrlArr.map((item, index) => {
              if (item === url) {
                requestUrlArr.splice(index, 1)
              }
            })
            // 请求api数组为空隐藏加载中弹层重置数组
            if (!requestUrlArr.length) {
              wepy.hideLoading()
              requestUrlArr = []
            }
          }
        })
      })
    })
  },
  fetch: (method, url, options) => {
    let accessToken = wx.getStorageSync('accessToken')
    return getUserSystem().then((systemRes) => {
      // console.log(systemRes);
      // 统计不需要显示loading标识
      if (options.data.hideLoading) {
        loadingFlag.push(options.data.hideLoading)
      }
      if (!options.data.hideLoading && !requestUrlArr.length && !loadingFlag.length) {
        wepy.showLoading({
          title: options.message || '加载中',
          mask: true
        })
      }
      requestUrlArr.push(url)
      return new Promise((resolve, reject) => {
        wepy.request({
          url: url,
          data: options.data || {},
          header: {
            'content-type': options.contentType || 'application/x-www-form-urlencoded',
            // 'Authorization': `Bearer ${accessToken}`,
            // 'Authorization': `Bearer eeHNyiKVVjsY8LtwNTFLej8FhGlfSP-d-u16NkTdNfpbHVAkwIBpRJjZ1gb9nPPctjoOmOVGWzbaFedf9_tlq2rnQlsd-WLkhr-FuDzBFDO9Lb94eeqJdG8RZM8-G5hkcmTmitzJ5ezWkiS1Ij_UJ4Epblaoq-VHS02Scop3l4YtlZ3D3dRkvuIvZq0i9m3tZzCOiRsUcY6l2VrSRpXwMKsYc9xUbkAIjTxgeIwG-MJvAd4o95MfCdxVAbJlayLrEBOrhQ`,
            'sMsg': JSON.stringify(systemRes)
          },
          method: method,
          success: function (res) {
            const result = res.data
            if (res.statusCode === 200 || res.statusCode === 304) {
              resolve(result)
            } else {
              // 捕获错误信息
              if (res.data.Error) {
                const errorMsg = res.data.Error.Message
                wepy.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 2000
                })
                resolve(result)
              } else {
                wepy.showToast({
                  title: '网络异常',
                  icon: 'none'
                })
              }
            }
            // 请求完成清除当前url
            requestUrlArr.map((item, index) => {
              if (item === url) {
                requestUrlArr.splice(index, 1)
              }
            })
          },
          fail: function (res) {
            wepy.hideLoading()
          },
          complete: function () {
            // console.log(requestUrlArr.length);
            // 请求api数组为空隐藏加载中弹层重置数组
            if (!requestUrlArr.length) {
              wepy.hideLoading()
              requestUrlArr = []
              loadingFlag = []
            }
          }
        })
      })
    })
  }
}
export {
  lotusAjax
}
