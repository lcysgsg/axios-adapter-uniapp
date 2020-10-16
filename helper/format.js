// var utils = require("axios/lib/utils");
var settle = require('axios/lib/core/settle')
// var cookies = require("axios/lib/helpers/cookies");
var buildURL = require('axios/lib/helpers/buildURL')
var buildFullPath = require('axios/lib/core/buildFullPath')
// var parseHeaders = require("axios/lib/helpers/parseHeaders");
// var isURLSameOrigin = require("axios/lib/helpers/isURLSameOrigin");
// var createError = require("axios/lib/core/createError");
const isUploadFile = require('./isUploadFile')

module.exports = function format(config, resolve, reject) {
  const fullPath = buildFullPath(config.baseURL, config.url)
  const requestHeaders = config.headers

  const uniConfig = {
    ...config,
    url: buildURL(fullPath, config.params, config.paramsSerializer),

    // uniapp 用的是 header
    header: requestHeaders,
  }

  if (isUploadFile(config)) {
    delete requestHeaders['Content-Type'] // Let the browser set it
    if (config.formData) {
      uniConfig.formData = config.formData
    } else {
      // application/json 且 data isObject 时， 发送前会对 config.data 进行 JSON.stringify 处理
      // uniapp 内部会处理，即需要的就是 object， 所以需要提前 parse
      if (typeof config.data === 'string') {
        // 如果，config.data 数据格式不合适，还是选择报错
        uniConfig.formData = JSON.parse(config.data)
      } else {
        uniConfig.formData = config.data
      }
    }
  } else if (config.method === 'get') {
    // 兼容 get 时的 params 字段
    uniConfig.data = config.data ? config.data : config.params
  } else {
    uniConfig.data = config.data
  }

  // HTTP basic authentication
  if (config.auth) {
    var username = config.auth.username || ''
    var password = unescape(encodeURIComponent(config.auth.password)) || ''
    requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password)
  }

  uniConfig.complete = function (response) {
    // 暂时不明白为什么要判断 responseType === 'text'，也许返回结果是有多种格式的，但是目前没碰到。
    // var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
    var result = {
      data: response.data,
      status: response.statusCode,
      statusText: response.errMsg,
      header: response.header,
      config: config,
      // request: request
    }

    settle(resolve, reject, result)
  }

  return uniConfig
}
