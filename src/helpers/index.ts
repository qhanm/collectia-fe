import {SESSION} from "./constant";

export function showLoading() {
    const el = document.getElementById("qloadder");
    if (el) {
        el.style.display = "block";
    }
}

export function hideLoading() {
    const el = document.getElementById("qloadder");
    if (el) {
        el.style.display = "none";
    }
}

export const setSession = (key: string, value: any) => {
    sessionStorage.setItem(key, value);
}

export const getSession = (key: string, isParse = false) => {
    try {
        let data: any = sessionStorage.getItem(key);
        if(isParse){
            data = JSON.parse(data);
        }
        return data;
    }catch (err){}
    return  null;
}

export const getToken = (type = 'user') => {
    const user = getSession(type === 'user' ? SESSION.USER : SESSION.CLIENT, true);
    return user?.token;
}


export const getAppToken = () => {
    const user = getSession(SESSION.USER, true);
    return user?.user?.appToken;
}

export const getRegisterAppUrl = () => {
    const user = getSession(SESSION.USER, true);
    return user?.user?.registerAppUrl;
}
