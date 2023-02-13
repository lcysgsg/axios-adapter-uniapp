# axios-adapter-uniapp

用于 uni-app 的 `axios` adapter，目的是统一请求函数的使用姿势

基于 [`axios/lib/adapters/xhr.js`](https://github.com/axios/axios/blob/v1.x/lib/adapters/xhr.js) 文件

利用 `axios` params.adapter 增加了对 uni-app 的 `uni.request` 和 `uni.uploadFile` 的适配器

**欢迎 issue 和 pr**

## 注意

- 【#1】`config.timeout`: uniapp 默认值 `60000ms`，如果设置为 `0` 是真当 `0ms` 处理的；`axios` 默认值是 `0`。所以不考虑存在有 `0` 的情况，默认值修正为 `60000ms` 且 `timeout === 0` 时也修正为 `60000ms`
- 中止请求的方式沿用 `axios` Cancellation，不再支持 `uni.request.abort()`
- `GET` 增加了取 `config.data` 参数的判断，且会优先取 `config.data` 忽略 `config.params`
- 上传文件同样受限于 `uni.uploadFile`
- 触发 `uni.uploadFile` 通过判断参数触发，需要满足 2 个条件：
  - `POST`
  - `config.filePath && config.name` 或 `Array.isArray(config.files) && config.files.length > 0`
- `uni.uploadFile` 传递额外参数时， `config.formData`（优先），但也扩展了会处理 `config.data` 
## TODO

- [ ] 验证是否需要类似的封装——监听上传进度变化
- [ ] examples
- [ ] 测试用例是模拟的，仅校验了配置数据格式，考虑用 uniapp 接口做测试。 [https://uniapp.dcloud.io/collocation/auto/quick-start](https://uniapp.dcloud.io/collocation/auto/quick-start)

## 测试情况

- web
  - vue2：通过
  - vue3：通过
- 微信小程序

## 安装

Using npm:

`$ npm install axios-adapter-uniapp`

Using yarn:

`$ yarn add axios-adapter-uniapp`

## 用法

> 就是 axios ， 具体看 axios 文档， 这里大概的列一下

[axios](https://www.npmjs.com/package/axios)

[uniapp request](https://uniapp.dcloud.io/api/request/request)

[uniapp network-file](https://uniapp.dcloud.io/api/request/network-file)

### 例子

例子都是 `config` 风格，链式也支持，更多例子可以看根目录下的 `__tests__/index.spec.js`

```js
// '@/common/js/axios/index.js'

import axios from 'axios'
import axiosAdapterUniapp from 'axios-adapter-uniapp'

const instance = axios.create({
  baseURL: 'URL.com',
  adapter: axiosAdapterUniapp,
})

// request拦截器
instance.interceptors.request.use()

// respone拦截器
instance.interceptors.request.use()

export default instance
```

`GET`

```js
import axios from '@/common/js/axios/index.js'

axios({
  method: 'get',
  url: '/user',
  data: {
    id: 1,
  },
})

axios({
  method: 'get',
  url: '/user',
  params: {
    id: 1,
  },
})

// 两者结果相同 =>
// URL.com/user?id=1
```

`POST`

```js
import axios from '@/common/js/axios/index.js'

axios({
  method: 'post',
  url: '/user',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone',
  },
})
```

`UPLOAD`，要触发 `uni.uploadFile` 需要满足 2 个条件：

- `POST`
- `config.filePath && config.name` 或 `Array.isArray(config.files) && config.files.length > 0`

```js
import axios from '@/common/js/axios/index.js'

axios({
  method: 'post',
  url: '/avatar',
  filePath: uri,
  name: 'file',
  formData: {
    firstName: 'Fred',
    lastName: 'Flintstone',
  },
})

axios({
  method: 'post',
  url: '/avatar',
  files: [
    // 多文件上传有注意事项的，看uni文档
    { name: 'file', uri: uri },
  ],
  formData: {
    firstName: 'Fred',
    lastName: 'Flintstone',
  },
})
```

## Cancellation

同 `axios`——`AbortController`、`CancelToken` 都支持

`CancelToken` 取消请求， [https://www.npmjs.com/package/axios#cancellation](https://www.npmjs.com/package/axios#cancellation)

```js
import axios from '@/common/js/axios/index.js'

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios({
  ...,
  cancelToken: source.token
}).catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // handle error
  }
});

// 或者

const CancelToken = axios.CancelToken;
let cancel;

axios({
  ...,
  cancelToken: new CancelToken(function executor(c) {
    // An executor function receives a cancel function as a parameter
    cancel = c;
  })
});

// cancel the request
cancel();
```
