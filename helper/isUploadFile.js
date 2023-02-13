import isMultiUpload from './isMultiUpload'

function isUploadFile(config) {
  if (config.method === 'post') {
    if (config.filePath && config.name) return true

    if (isMultiUpload(config)) return true
  }

  return false
}

// module.exports = isUploadFile

export default isUploadFile
