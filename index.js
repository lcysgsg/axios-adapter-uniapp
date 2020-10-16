/* global uni */
'use strict'

// var utils = require("axios/lib/utils");
var settle = require('axios/lib/core/settle')
// var cookies = require("axios/lib/helpers/cookies");
var buildURL = require('axios/lib/helpers/buildURL')
var buildFullPath = require('axios/lib/core/buildFullPath')
// var parseHeaders = require("axios/lib/helpers/parseHeaders");
// var isURLSameOrigin = require("axios/lib/helpers/isURLSameOrigin");
// var createError = require("axios/lib/core/createError");
const isMultiUpload = require('./helper/isMultiUpload')
const isUploadFile = require('./helper/isUploadFile')

/**
 * 参数配置参考：
 *   > axios          https://www.npmjs.com/package/axios#request-config
 *   > uniapp request https://uniapp.dcloud.io/api/request/request
 *   > uniapp upload  https://uniapp.dcloud.io/api/request/network-file
 * @param {object} config
 */
module.exports = function uniappAdapter(config = {}) {
  return new Promise(function dispatchUniApp(resolve, reject) {
    const fullPath = buildFullPath(config.baseURL, config.url)
    const isUpload = isUploadFile(config)
    const requestHeaders = config.headers
    const uniConfig = {
      ...config,
      url: buildURL(fullPath, config.params, config.paramsSerializer),

      // uniapp 用的是 header
      header: requestHeaders,
    }

    if (isUpload) {
      delete requestHeaders['Content-Type'] // Let the browser set it

      if (config.formData) {
        uniConfig.formData = config.formData
      } else {
        uniConfig.formData = config.data
      }

      // 非 app||h5 不支持多文件上传
      // #ifndef APP-PLUS || H5
      if (config.name && config.filePath) {
        uniConfig.name = config.name
        uniConfig.filePath = config.filePath
      } else {
        uniConfig.name = config.files[0].name
        uniConfig.filePath = config.files[0].uri
      }
      // #endif

      // #ifdef APP-PLUS || H5
      if (isMultiUpload(config)) {
        uniConfig.files = config.files
      } else {
        uniConfig.name = config.files[0].name
        uniConfig.filePath = config.files[0].uri
      }
      // #endif
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

    let requestTask = null
    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!requestTask) {
          return
        }

        requestTask.abort()
        reject(cancel)
        // Clean up request
        requestTask = null
      })
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
    // Send the request
    if (isUpload) {
      requestTask = uni.uploadFile(uniConfig)
    } else {
      requestTask = uni.request(uniConfig)
    }
  })
}
