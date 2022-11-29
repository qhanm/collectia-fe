import axios from "axios";
import { History } from "../../history";
import {ROUTE} from "../../routes";
import {API_URL} from "../constant";

// default
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

// intercepting to capture errors
axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        let message;
        switch (error?.response?.status) {
            case 500:
                message = "Internal Server Error";
                break;
            case 401:
                localStorage.clear();
                //return History.push(ROUTE.clientLogin)
                break;
            // case 403:
            //     QHistory.push(RouteDefine.forbidden);
            //     break;
            case 404:
                message = "Sorry! the data you are looking for could not be found";
                break;
            default:
                message = error.message || error;
        }

        if(error?.response?.status === 403){
            return error.request;
        }

        if(error?.response?.status === 400){
            return Promise.reject(error?.response);
        }

        else
            return Promise.reject(message);
    }
);

const setAuthorization = (token: string) => {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

const APIClient = {
    get: (url: string, params: object|any, isAuth = true) => {
        let response;

        let paramKeys: Array<any> = [];

        if (params) {
            Object.keys(params).map(key => {
                paramKeys.push(key + '=' + params[key]);
                return paramKeys;
            });

            const queryString = paramKeys && paramKeys.length ? paramKeys.join('&') : "";
            response = axios.get(`${url}?${queryString}`, params);
        } else {
            response = axios.get(`${url}`, params);
        }

        return response;
    },

    post: (url: string, data : any, isAuth = true) => {
        return axios.post(url, data);
    },
    /**
     * Updates data
     */
    put: (url: string, data: any, isAuth = true) => {
        return axios.put(url, data);
    },

    delete: (url: string, config : any, isAut = true) => {
        return axios.delete(url, { ...config });
    },
}
const getLoggedinUser = () => {
    const user = sessionStorage.getItem("authUser");
    if (!user) {
        return null;
    } else {
        return JSON.parse(user);
    }
};

export { APIClient, setAuthorization, getLoggedinUser };
