import React from "react";
import UserForm from "../../components/UserForm";
import {useParams} from "react-router-dom";

const EditUser = () => {
    const { id } : any = useParams();

    return (
        <>
            <UserForm id={id}/>
        </>
    )
}

export default EditUser;
