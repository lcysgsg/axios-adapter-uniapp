用于 uni-app 的 `axios` adapter

利用 `axios` params.adapter 增加了 uni-app 的 `uni.request` 和 `uni.uploadFile` 的适配器

基于原来的 `xhr.js` adapter 调整而来，保留了中止请求的 `cancelToken` 用法

**欢迎 issue 和 pr**

## TODO

- [ ] examples
- [ ] 测试用例是模拟的，仅校验了配置数据格式，考虑用 uniapp 接口做测试。 [https://uniapp.dcloud.io/collocation/auto/quick-start](https://uniapp.dcloud.io/collocation/auto/quick-start)

## 安装

Using npm:

`$ npm install axios-adapter-uniapp`

Using yarn:

`$ yarn add axios-adapter-uniapp`

直接引用：

去[仓库](https://github.com/lcysgsg/axios-adapter-uniapp)复制

## 用法

> 就是 axios ， 具体看 axios 文档， 这里大概的列一下

[axios](https://www.npmjs.com/package/axios)

[uniapp request](https://uniapp.dcloud.io/api/request/request)

[uniapp network-file](https://uniapp.dcloud.io/api/request/network-file)

### 适配了什么

- `GET`
  - 兼容了字段 `data`， `data`（优先） 和 `params` 效果相同。
- `POST`
  - 上传文件，要触发 `uni.uploadFile` 需要满足 2 个条件：
    - `POST`
    - `config.filePath && config.name` 或 `Array.isArray(config.files) && config.files.length > 0`
- 取消请求，不能支持 uniapp 原先的方法——因为 `Promise`，支持使用 axios CancelToken 的用法

### 例子

例子都是 `config` 风格， 也是我推荐的（），链式也支持，更多例子可以看根目录下的 `__tests__/index.spec.js`

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
