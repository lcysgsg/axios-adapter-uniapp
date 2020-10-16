const isMultiUpload = require('../isMultiUpload')
const isUploadFile = require('../isUploadFile')

test('【helper】isMultiUpload', () => {
  let config

  config = {
    files: [],
  }
  expect(isMultiUpload(config)).toBe(false)

  config = {
    files: new Array(1),
  }
  expect(isMultiUpload(config)).toBe(true)
})

test('【helper】isUploadFile ', () => {
  let config

  config = {}
  expect(isUploadFile(config)).toBe(false)

  config = {
    method: 'get'
  }
  expect(isUploadFile(config)).toBe(false)

  config = {
    method: 'post',
  }
  expect(isUploadFile(config)).toBe(false)

  config = {
    method: 'post',
    filePath: '/a',
    name: 'file',
  }
  expect(isUploadFile(config)).toBe(true)

  config = {
    method: 'post',
    files: new Array(1),
  }
  expect(isUploadFile(config)).toBe(true)
})
