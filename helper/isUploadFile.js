const isMultiUpload = require('./isMultiUpload')

module.exports = function isUploadFile(config) {
  if (config.method === 'post') {
    if (config.filePath && config.name) return true

    if (isMultiUpload(config)) return true
  }

  return false
}
