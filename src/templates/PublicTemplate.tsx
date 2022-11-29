import React from "react";
import Header from "./components/Header";

const PublicTemplate = ({children} : any) => {

    return (
        <div className={"container"}>
            <Header />
            <div>
                { children }
            </div>
        </div>
    )
}

export default PublicTemplate;
