import CryptoJSLib from './CryptoJSLib'
import { lotusAjax } from './lotusAjax'
import { config } from './appConfig'
const lotusUtils = {
// 日期格式化
  dateFormat(val) {
    const time = val.split('-')
    time.map((item, index) => {
      if (item < 10) {
        time[index] = '0' + item
      }
    })
    return `${time[0]}-${time[1]}-${time[2]}`
  },
    // 加密
  getAesString(data) {
    const eKey = 'sa#65$f4'
    const ivs = 'gzsyfdgs'
    const key = CryptoJSLib.enc.Utf8.parse(eKey)
    const iv = CryptoJSLib.enc.Utf8.parse(ivs)
    const encrypted = CryptoJSLib.DES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJSLib.mode.CBC,
      padding: CryptoJSLib.pad.Pkcs7
    })
    return encrypted.toString() // 返回的是base64格式的密文
  },
    // 解密
  getDAesString(encrypted) {
        // 解密
    const eKey = 'sa#65$f4'
    const ivs = 'gzsyfdgs'
    const key = CryptoJSLib.enc.Utf8.parse(eKey)
    const iv = CryptoJSLib.enc.Utf8.parse(ivs)
    const decrypted = CryptoJSLib.DES.decrypt(encrypted, key, {
      iv: iv,
      mode: CryptoJSLib.mode.CBC,
      padding: CryptoJSLib.pad.Pkcs7
    })
    return decrypted.toString(CryptoJSLib.enc.Utf8)
  },
    // 函数节流 method为回调执行的方法，wait为执行的时间，_this为了让函数能获取到this的作用域
    /* throttle(method, wait,_this) {
        clearTimeout(method.tId);
        method.tId = setTimeout(()=>{
            return method.call(_this);
        },wait);
    }, */
    // 获取名片图片
  cardImg(config, wxCode, cardId, templateId, height) {
    const cardTemplateId = 1// 默认卡片模板ID
    const cardHeight = height || 222
    let imgTypeUrl = ''
    if (!templateId || templateId == 1) {
      imgTypeUrl = 'xyzPurple'
    } else if (templateId == 2) {
      imgTypeUrl = 'xyzYellow'
    } else if (templateId == 3) {
      imgTypeUrl = 'xyzGreen'
    } else if (templateId == 4) {
      imgTypeUrl = 'xyzBuild'
    } else if (templateId == 5) {
      imgTypeUrl = 'xyzFlower'
    }
    const imgType = config.xyzImg + `#/${imgTypeUrl}`
    const pageData = {
      actId: cardId, // 图片
      type: templateId || cardTemplateId,
      aId: wxCode
    }
    const params = {
      imgPreviewUrl: imgType,
      saveDir: 'xyz',
      pageData: JSON.stringify(pageData),
      clip: JSON.stringify({'x': 0, 'y': 0, 'width': 375, 'height': cardHeight}), // 222
      quality: 100,
      time: 3000,
      reuse: false
    }
    return new Promise((resolve, reject) => {
      lotusAjax.fetch('POST', config.xcxImg + 'posterCompound', {
        data: params
      }).then((response) => {
        let result = ''
        if (response && response.src) {
          result = config.xcxImg + 'static/xyz/' + response.src + '?' + new Date().getTime()
        }
        resolve(result)
      })
    })
  },
    // 转换option
  getOption(option) {
        /* let sceneObj = {};
        if(option.scene){
            const scene = decodeURIComponent(option.scene)
            const sceneArr = scene.split("&");
            sceneArr.map((item)=>{
                const itemArr = item.split("=");
                sceneObj[itemArr[0]] = itemArr[1]
            });
        }else{
            sceneObj = option;
        } */
        // 拼接url参数传入到授权页面
    let str = ''
    for (let itemKey in option) {
      str += `${itemKey}=${option[itemKey]}&`
    }
    return str
  },
    // 函数节流 method为回调执行的方法，wait为执行的时间，_this为了让函数能获取到this的作用域
  throttle(method, wait, _this, _event) {
    clearTimeout(method.tId)
    method.tId = setTimeout(() => {
      return method.call(_this, _event)
    }, wait)
  },
    //
  getCPSImage(wxCode, imgUrl, type) {
        // Type 1、点击报货 2.查看订单 3、确认订单
    return lotusAjax.fetch('GET', config.apiUrl + 'Catalog/GetCPSImage', {
      data: {
        WxDetailCode: wxCode,
        Imgpath: imgUrl,
        Type: type
      }
    }).then((response) => {
            // const result = response.Data;
      return response.Data
    })
  },
  addRecord(data) {
        // WxDetailCode
        // FWxDetailCode
        // SceneId:场景编号（分享商品传商品编号，分享优惠券传优惠券编号）
        // SceneType 场景类型（1.查看名片 2.拨打手机 3.转发名片 4.浏览店铺 5.分享店铺 6.查看优惠券 7.查看优惠活动
        // 8.分享优惠活动 9.查看动态 10.分享动态 11.查看公司 12.查看商品 13.分享商品 14.加入采购车 15.名片点赞
        // 16.复制微信号 17.存入通讯录 18.收藏店铺 19.领取优惠券 20.收藏商品）
    lotusAjax.fetch('POST', config.apiUrl + 'User/AddRecord', {
      data: data
    }, true).then((response) => {})
  },
  postFormId(e) {
    console.log(666, e.detail.formId)
    let formId = e.detail ? e.detail.formId : ''
    lotusAjax.fetch('GET', config.msg + 'FormId/HoldFormId', {
      data: {
        WxDetailCode: wx.getStorageSync('wxDetailCode'),
        FormId: formId.toString()
      }
    }, true).then((response) => {
      return response
    })
  }
}
const lotusDatas = {
  customerServiceTel: '17329970951'// 客服电话
}
module.exports = {
  lotusUtils,
  lotusDatas
}
