function isMultiUpload(config) {
  return Array.isArray(config.files) && config.files.length > 0
}

// module.exports = isMultiUpload

export default isMultiUpload
