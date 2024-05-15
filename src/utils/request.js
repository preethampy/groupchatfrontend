import axios from "axios";
import { backend } from "../config";
import store from "../app/store";

export default function request(method, url, data) {
    return new Promise((resolve, reject) => {
        const authDetails = store.getState()
            axios
                .request({
                    url: backend+url,
                    method: method,
                    headers: authDetails.auth.jwt !== null ? {
                        'Authorization': `Bearer ${authDetails.auth.jwt}`
                    }:{},
                    data: data ? data:{}
                }).then((resp) => {
                    resolve(resp.data)
                }).catch((err) => {
                    reject(err)
                })

    })
}
