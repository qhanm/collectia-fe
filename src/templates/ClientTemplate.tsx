import React from "react";
import Header from "./components/Header";
import {useHistory} from "react-router-dom";
import {getToken} from "../helpers";
import {ROUTE} from "../routes";
import {setAuthorization} from "../helpers/api";

const ClientTemplate = ({children} : any) => {
    const history = useHistory();

    const token = getToken('client');

    if(!token){

        let currentUrl = window.location.href;
        let urlObject = new URL(currentUrl);
        let token = urlObject.searchParams.get("token");
        let clientId =  urlObject.searchParams.get("clientId");
        if(!token || !clientId){
            history.push(ROUTE.clientLogin);
        }
    }else{
        setAuthorization(token);
    }

    return (
        <div className={"container"}>
            <Header />
            <div>
                { children }
            </div>
        </div>
    )
}

export default ClientTemplate;
