import React from "react";
import Header from "./components/Header";
import {getToken} from "../helpers";
import {useHistory} from "react-router-dom";
import {ROUTE} from "../routes";
import {setAuthorization} from "../helpers/api";

const AdminTemplate = ({children} : any) => {
    const history = useHistory();

    const token = getToken();

    if(!token){        
        history.push(ROUTE.login);
    }else{
        setAuthorization(token);
    }

    return (
        <div className={"container"}>
            <Header isChangePass />
            <div>
                { children }
            </div>
        </div>
    )
}

export default AdminTemplate;
