import axios from "axios";
import { backend } from "../config";
import store from "../app/store";

/**
 * This is a utility function to send requests to backend with JWT token attached to headers for authorization.
 * @param {*} method - request method [POST, GET, DELETE, PUT, PATCH].
 * @param {*} url - url to which we will make a request.
 * @param {*} data - data that we will pass along with request.
 * @returns response of the request or error returned from request made.
 */

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
