// dev
import {toast} from "sonner";
const username = "admin";
const password = "admin12345678";
window.BASE_API = 'http://43.138.177.172:8096'

function request(url, {method, payload, data, baseURL}) {
    const baseUrl = window.BASE_API  + '/dms-lite/api/v1'
    const currentUrl = (baseURL || baseUrl) + url


    const body = data || payload
    const met = method.toUpperCase()
    if(met === 'GET' && body && !url.includes('?')){
        let search = '?'
        Object.keys(body).forEach(key => {
            const value = body[key]
            search += `${key}=${value}&`
        })
        search = search.substring(0, search.length -1)
        url += search
    }

    console.log('current server:', currentUrl)
    return fetch(currentUrl, {
        method: met,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
        body: met === 'GET' ? null : JSON.stringify(body),
    })
        .then(response => {
            if(url.includes('/health')){
                if (response.status === 200 && response.ok === true){
                    return true
                }else{
                    return false
                }
            }
            return response.json()
        })
        .then(res => {

            if (res && res.error && res.error.detail ) {
                if (typeof res.error.detail === 'object' ){
                    Object.keys(res.error.detail).forEach(key => {
                        throw new Error(res.error.detail[key])
                    })
                } else {
                    throw new Error(res.error.detail)
                }
            }

            if (res?.message && !res?.data){
                throw new Error(res?.message)
            }

            return res
        })
        .catch(e => {
            toast.error(e.message || 'error')
            return Promise.reject()
        })
}

export default request


