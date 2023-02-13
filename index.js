'use strict'

// import utils from './copy/utils.js'
import settle from './copy/core/settle.js'
import cookies from './copy/helpers/cookies.js'
import buildURL from './copy/helpers/buildURL.js'
import buildFullPath from './copy/core/buildFullPath.js'
import isURLSameOrigin from './copy/helpers/isURLSameOrigin.js'
import transitionalDefaults from './copy/defaults/transitional.js'
import AxiosError from './copy/core/AxiosError.js'
import CanceledError from './copy/cancel/CanceledError.js'
import parseProtocol from './copy/helpers/parseProtocol.js'
import platform from './copy/platform/index.js'
import AxiosHeaders from './copy/core/AxiosHeaders.js'
// import speedometer from './copy/helpers/speedometer.js'
import isUploadFile from './helper/isUploadFile'

// function progressEventReducer(listener, isDownloadStream) {
//   let bytesNotified = 0
//   const _speedometer = speedometer(50, 250)

//   return (e) => {
//     const loaded = e.loaded
//     const total = e.lengthComputable ? e.total : undefined
//     const progressBytes = loaded - bytesNotified
//     const rate = _speedometer(progressBytes)
//     const inRange = loaded <= total

//     bytesNotified = loaded

//     const data = {
//       loaded,
//       total,
//       progress: total ? loaded / total : undefined,
//       bytes: progressBytes,
//       rate: rate ? rate : undefined,
//       estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
//       event: e,
//     }

//     data[isDownloadStream ? 'download' : 'upload'] = true

//     listener(data)
//   }
// }

const isUniAppAdapterSupported = typeof uni.request !== 'undefined'

export default isUniAppAdapterSupported &&
  function (config) {
    return new Promise(function dispatchUniAppRequest(resolve, reject) {
      const fullPath = buildFullPath(config.baseURL, config.url)
      const uniConfig = {
        ...config,
        url: buildURL(fullPath, config.params, config.paramsSerializer),

        // 详见 README.md -> 注意 ->【#1】
        timeout: !config.timeout ? 60000 : config.timeout,
      }

      let requestTask = null
      const requestMethod = config.method.toUpperCase()
      const requestHeaders = AxiosHeaders.from(config.headers).normalize()
      const responseType = config.responseType
      let onCanceled
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled)
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled)
        }
      }

      // if (
      //   utils.isFormData(requestData) &&
      //   (platform.isStandardBrowserEnv ||
      //     platform.isStandardBrowserWebWorkerEnv)
      // ) {
      //   requestHeaders.setContentType(false) // Let the browser set it
      // }

      if (isUploadFile(config)) {
        requestHeaders.setContentType(false) // Let the browser set it

        if (config.formData) {
          uniConfig.formData = config.formData
        } else {
          // application/json 且 data isObject 时， 发送前会对 config.data 进行 JSON.stringify 处理
          // uniapp 内部会处理，即需要的就是 object， 所以需要提前 parse
          if (typeof config.data === 'string') {
            // 如果config.data 数据格式不正确，还是会得到一个错误
            uniConfig.formData = JSON.parse(config.data)
          } else {
            uniConfig.formData = config.data
          }
        }
      } else if (requestMethod === 'GET') {
        // 兼容 GET 时的 params 字段
        uniConfig.data = config.data ? JSON.parse(config.data) : config.params
      } else {
        uniConfig.data = JSON.parse(config.data)
      }

      // HTTP basic authentication
      if (config.auth) {
        const username = config.auth.username || ''
        const password = config.auth.password
          ? unescape(encodeURIComponent(config.auth.password))
          : ''
        requestHeaders.set(
          'Authorization',
          'Basic ' + btoa(username + ':' + password)
        )
      }

      function onloadend(result) {
        if (!requestTask) {
          return
        }
        // Prepare the response
        const response = {
          data: result.data,
          status: result.statusCode,
          statusText: result.errMsg,
          headers: result.header,
          config,
          request: requestTask,
        }

        settle(
          function _resolve(value) {
            resolve(value)
            done()
          },
          function _reject(err) {
            reject(err)
            done()
          },
          response
        )

        // Clean up request
        requestTask = null
      }

      uniConfig.complete = onloadend
      uniConfig.fail = (error) => {
        switch (error.errMsg) {
          // Handle low level network errors
          case 'request:fail':
            // Real errors are hidden from us by the browser
            // onerror should only fire if it's a network error
            reject(
              new AxiosError(
                'Network Error',
                AxiosError.ERR_NETWORK,
                config,
                requestTask,
                error
              )
            )

            // Clean up request
            requestTask = null
            break

          case 'request:fail timeout':
            {
              let timeoutErrorMessage = uniConfig.timeout
                ? 'timeout of ' + uniConfig.timeout + 'ms exceeded'
                : 'timeout exceeded'
              const transitional = config.transitional || transitionalDefaults
              if (config.timeoutErrorMessage) {
                timeoutErrorMessage = config.timeoutErrorMessage
              }
              reject(
                new AxiosError(
                  timeoutErrorMessage,
                  transitional.clarifyTimeoutError
                    ? AxiosError.ETIMEDOUT
                    : AxiosError.ECONNABORTED,
                  config,
                  requestTask,
                  error
                )
              )

              // Clean up request
              requestTask = null
            }
            break
          default:
            reject(error)
            break
        }
      }

      // TODO: 需要一个触发该状态的例子
      // Handle browser request cancellation (as opposed to a manual cancellation)
      // request.onabort = function handleAbort() {
      //   if (!request) {
      //     return
      //   }

      //   reject(
      //     new AxiosError(
      //       'Request aborted',
      //       AxiosError.ECONNABORTED,
      //       config,
      //       request
      //     )
      //   )

      //   // Clean up request
      //   request = null
      // }

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (platform.isStandardBrowserEnv) {
        // Add xsrf header
        const xsrfValue =
          (config.withCredentials || isURLSameOrigin(fullPath)) &&
          config.xsrfCookieName &&
          cookies.read(config.xsrfCookieName)

        if (xsrfValue) {
          requestHeaders.set(config.xsrfHeaderName, xsrfValue)
        }
      }

      // 如果你也不理解为什么 data 为空要移除 Content-Type
      // 简而言之：Content-Type 用于定义传递的数据类型，如果没有数据就不应该设置。如果与后端对接出现问题，此处应该说服后端调整。说不通，那就为data随便设置点什么吧
      // 这里有个讨论：https://github.com/axios/axios/issues/86
      // Remove Content-Type if data is undefined
      uniConfig.data === undefined && requestHeaders.setContentType(null)

      // Add headers to the request
      // if ('setRequestHeader' in request) {
      //   utils.forEach(
      //     requestHeaders.toJSON(),
      //     function setRequestHeader(val, key) {
      //       request.setRequestHeader(key, val)
      //     }
      //   )
      // }
      uniConfig.header = requestHeaders.toJSON()

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        uniConfig.responseType = config.responseType
      }

      // TODO：验证是否需要类似的封装——监听上传进度变化
      // Handle progress if needed
      // if (typeof config.onDownloadProgress === 'function') {
      //   request.addEventListener(
      //     'progress',
      //     progressEventReducer(config.onDownloadProgress, true)
      //   )
      // }

      // TODO：验证是否需要类似的封装——监听上传进度变化
      // Not all browsers support upload events
      // if (typeof config.onUploadProgress === 'function' && request.upload) {
      //   request.upload.addEventListener(
      //     'progress',
      //     progressEventReducer(config.onUploadProgress)
      //   )
      // }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = (cancel) => {
          if (!requestTask) {
            return
          }

          requestTask.abort()
          reject(
            !cancel || cancel.type
              ? new CanceledError(null, config, requestTask)
              : cancel
          )
          requestTask = null
        }

        config.cancelToken && config.cancelToken.subscribe(onCanceled)
        if (config.signal) {
          config.signal.aborted
            ? onCanceled()
            : config.signal.addEventListener('abort', onCanceled)
        }
      }

      const protocol = parseProtocol(fullPath)

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(
          new AxiosError(
            'Unsupported protocol ' + protocol + ':',
            AxiosError.ERR_BAD_REQUEST,
            config
          )
        )
        return
      }

      // Send the request
      if (isUploadFile(config)) {
        requestTask = uni.uploadFile(uniConfig)
      } else {
        requestTask = uni.request(uniConfig)
      }
    })
  }
