用于 uni-app 的 `axios` adapter

利用 `axios` params.adapter 增加了 uni-app 的 `uni.request` 和 `uni.uploadFile` 的适配器

基于原来的 `xhr.js` adapter 调整而来，保留了中止请求的 `cancelToken` 用法

## 安装

**依赖 axios，要记得安装**

Using npm:

`$ npm install axios-adapter-uniapp`

Using yarn:

`$ yarn add axios-adapter-uniapp`

直接引用：

去[仓库](https://github.com/lcysgsg/axios-adapter-uniapp)里把 `index.js` 拷到项目里引用

## 用法

> 就是 axios ， 具体看 axios 文档， 这里给小白大概的列一下

[axios](https://www.npmjs.com/package/axios)

[uniapp request](https://uniapp.dcloud.io/api/request/request)

[uniapp network-file](https://uniapp.dcloud.io/api/request/network-file)

```js
// '@/common/js/axios/index.js'

import axios from "axios";
import axiosAdapterUniapp from "axios-adapter-uniapp";

const instance = axios.create({
  baseURL: 'BASEURL.com',
  adapter: axiosAdapterUniapp,
});

// request拦截器
instance.interceptors.request.use()

// respone拦截器
instance.interceptors.request.use()

export default instance;
```

`GET`

```js
import axios from '@/common/js/axios/index.js'

axios({
  method: 'get',
  url: '/user',
  data: {
    id: 1
  }
});
```

`POST`

```js
axios({
  method: 'post',
  url: '/user',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

`UPLOAD`，调用 `uni.uploadFile` 需要满足条件：
- `POST`
- `config.filePath && config.name` 或 `Array.isArray(config.files) && config.files.length > 0`

```js
axios({
  method: 'post',
  url: '/avatar',
  filePath: uri,
  name: 'file',
  formData: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});

axios({
  method: 'post',
  url: '/avatar',
  files: [
    // 多文件上传有注意事项的，看uni文档
    { name: 'file', uri: uri }
  ],
  formData: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

`CancelToken` 取消请求， [https://www.npmjs.com/package/axios#cancellation](https://www.npmjs.com/package/axios#cancellation)

```js
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
