// import platform from './node/index.js';
import platform from './browser/index'
// 我不知道它是怎么做到自动切换不同平台的，看起来是手动切换，但应该不是这样
export { platform as default }
