const axios = require('axios')
const format = require('../helper/format')
const isUploadFile = require('../helper/isUploadFile')

function uniappAdapter_TEST(config = {}) {
  return new Promise(function dispatchUniApp(resolve, reject) {
    const uniConfig = format(config, resolve, reject)

    resolve(uniConfig)
  })
}
const instance = axios.create({
  baseURL: 'URL.com',
  adapter: uniappAdapter_TEST,
})

test('校验 uniConfig', () => {
  let config

  config = {
    method: 'GET',
  }
  instance(config).then((res) => {
    expect(res.method).toBe('get')
  })

  config = {
    method: 'POST',
  }
  instance(config).then((res) => {
    expect(res.method).toBe('post')
  })

  config = {
    url: '/user',
    params: {
      a: 1,
      b: 2,
    },
  }
  instance(config).then((res) => {
    expect(res.method).toBe('get')
    expect(res.url).toBe('URL.com/user?a=1&b=2')
  })

  config = {
    method: 'post',
    url: '/user',
    params: {
      a: 1,
      b: 2,
    },
  }
  instance(config).then((res) => {
    expect(res.method).toBe('post')
    expect(res.url).toBe('URL.com/user?a=1&b=2')
  })

  config = {
    method: 'post',
    url: '/user',
    params: {
      a: 1,
      b: 2,
    },
    data: {
      aa: 1,
      bb: 2,
    },
    formData: {
      aa: 1,
      bb: 2,
    },
  }
  instance(config).then((res) => {
    expect(res.data).toEqual({
      aa: 1,
      bb: 2,
    })
    expect(res.url).toBe('URL.com/user?a=1&b=2')
  })
})

test('request alias', () => {
  let config

  config = {
    params: {
      a: 1,
      b: 2,
    },
  }
  instance.get('/user', config).then((res) => {
    expect(res.method).toBe('get')
    expect(res.url).toBe('URL.com/user?a=1&b=2')
  })

  config = {
    data: {
      a: 3,
      b: 4,
    },
    headers: {
      say: 'hi',
    },
  }
  instance
    .post(
      '/user',
      {
        a: 1,
        b: 2,
      },
      config
    )
    .then((res) => {
      expect(res.headers.say).toEqual('hi')
      expect(res.data).toEqual({
        a: 1,
        b: 2,
      })
    })
})

test('upload', () => {
  let config = {}

  config = {
    method: 'post',
    url: '/upload',
    params: {
      a: 1,
      b: 2,
    },
    data: {
      aa: 1,
      bb: 2,
    },
    files: [{ name: 'file', uri: '/path' }],
  }
  instance(config).then((res) => {
    expect(isUploadFile(res)).toEqual(true)
    expect(res.formData).toEqual({
      aa: 1,
      bb: 2,
    })
    expect(res.url).toBe('URL.com/upload?a=1&b=2')
  })

  config = {
    method: 'post',
    url: '/upload',
    params: {
      a: 1,
      b: 2,
    },
    data: {
      aa: 1,
      bb: 2,
    },
    filePath: '/path',
    name: 'file',
  }
  instance(config).then((res) => {
    expect(isUploadFile(res)).toEqual(true)
    expect(res.formData).toEqual({
      aa: 1,
      bb: 2,
    })
    expect(res.url).toBe('URL.com/upload?a=1&b=2')
  })
})
