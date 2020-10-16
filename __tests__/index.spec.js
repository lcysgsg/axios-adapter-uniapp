// const axios = require('axios')

const isMultiUpload = require('../helper/isMultiUpload')
const isUploadFile = require('../helper/isUploadFile')

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

// const instance = axios.create({
//   baseURL: 'BASEURL.com',
//   adapter: axiosAdapterUniapp,
// })

// test('配置', () => {
//   instance
//     .get('/user')
//     .then((result) => {
//       console.log(result)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
//     .finally((res) => {
//       console.log(res)
//     })
// })
