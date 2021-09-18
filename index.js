/* global uni */
'use strict'

const isUploadFile = require('./helper/isUploadFile')
const format = require('./helper/format')

/**
 * 参数配置参考：
 *   > axios          https://www.npmjs.com/package/axios#request-config
 *   > uniapp request https://uniapp.dcloud.io/api/request/request
 *   > uniapp upload  https://uniapp.dcloud.io/api/request/network-file
 * @param {object} config
 */
function uniappAdapter(config = {}) {
  return new Promise(function dispatchUniApp(resolve, reject) {
    const uniConfig = format(config, resolve, reject)

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

    // Send the request
    if (isUploadFile(config)) {
      requestTask = uni.uploadFile(uniConfig)
    } else {
      requestTask = uni.request(uniConfig)
    }
  })
}
module.exports = uniappAdapter

// Allow use of default import syntax in TypeScript
module.exports.default = uniappAdapter
