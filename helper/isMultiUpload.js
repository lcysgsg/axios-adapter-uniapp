module.exports = function isMultiUpload(config) {
  return Array.isArray(config.files) && config.files.length > 0
}
