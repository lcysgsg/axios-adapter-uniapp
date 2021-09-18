import type { AxiosPromise, AxiosRequestConfig } from 'axios'

declare function uniappAdapter(config: AxiosRequestConfig): AxiosPromise<any>

export default uniappAdapter
