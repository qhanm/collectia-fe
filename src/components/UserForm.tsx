import React, {useEffect, useState} from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "./base/Input";
import {getSession, hideLoading, setSession, showLoading} from "../helpers";
import {ROUTE} from "../routes";
import {APIClient} from "../helpers/api";
import {useHistory, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {SESSION} from "../helpers/constant";

interface Props {
    id?: any,
    isPublic?: boolean,
}

const UserForm: React.FC<Props> = ({ id = null, isPublic = false }) => {
    const history = useHistory();
    const inputRef = React.useRef( null );
    const [error, setError] = useState("");
    const [client, setClient] = useState <any>({
        token: "",
        userRef: "",
        clientId: "",
        //password: "",
        feeText: "",
        interestText: "",
        cvr: "",
        phone: "",
        address: "",
        email: "",
        status: false,
    });

    const formik: any = useFormik({
        initialValues: client,
        validationSchema: Yup.object().shape({
            token: Yup.string().required("Token er et obligatorisk felt"),
            clientId: Yup.string().required("Kunde nr er et obligatorisk felt"),
            cvr: Yup.string().required("Cvr er et obligatorisk felt"),
            phone: Yup.string().required("Telefon nr. er et obligatorisk felt"),
            address: Yup.string().required("Adresse er et obligatorisk felt"),
            email: Yup.string().required("E-mail adresse er et obligatorisk felt"),
            userRef: Yup.string().required("Firma er et obligatorisk felt"),
        }),
        enableReinitialize: true,
        onSubmit: async (values) => {

            const data: any = {...values};
            data.status = data.status === true ? 1 : 0;

            await showLoading();
            try {
                if(id){
                    const res = await APIClient.put(`/users/${id}`, data);
                    if(res?.data?.code === 1){
                        toast.success(res?.data?.message, {
                            position: "bottom-right",
                            autoClose: 3000,
                        })
                        history.push(ROUTE.user);
                    }
                }else{
                    const res = await APIClient.post('/users', data);
                    if(isPublic){
                        toast.success("Create success", {
                            position: "bottom-right",
                            autoClose: 3000,
                        })

                        try{
                            const loginRes = await APIClient.post("/authenticate", {
                                userName: values?.clientId,
                                password: values.token,
                                rememberMe: true
                            })

                            if(loginRes?.data?.code == 1){
                                setSession(SESSION.CLIENT, JSON.stringify(loginRes?.data?.data));
                                history.push(ROUTE.client);
                            }else{
                                history.push(ROUTE.clientLogin);
                            }
                        }catch(err){
                            history.push(ROUTE.clientLogin);
                        }

                    } else if(res?.data?.code === 1){
                        toast.success(res?.data?.message, {
                            position: "bottom-right",
                            autoClose: 3000,
                        })
                        history.push(ROUTE.user);
                    }
                }
            }catch (err: any){
                if(err?.data?.code === -1){
                    setError(err?.data?.data);
                }
            }

            await hideLoading();
        }
    })

    const onOpenNewWindow = () => {
        const prepare = getSession(SESSION.PREPARE_CLIENT, true)

        if(!prepare?.registerAppUrl){
            toast.error("Get token fail please check authentication", {
                position: "bottom-right",
                autoClose: 3000,
            })
        }else{
            let url = `${prepare.registerAppUrl}&redirectUrl=${window.location.origin}/users/${id ? `edit/${id}` : 'create'}`
            window.open(url, "", "width=500,height=500,top: 50%");
        }

    }

    useEffect(() => {
        prepareData().then();

        if (window.opener) {
            let currentUrl = window.location.href;
            let urlObject = new URL(currentUrl);
            let token = urlObject.searchParams.get("token");
            if(token){
                window.opener.document.getElementById("token").value = token;
                window.opener.document.getElementById("token").focus();
                window.close();
            }
        }

        const inputElement: any = inputRef.current;
        if(inputElement){
            const handleEvent = async ( event: any) => {
                if(event.target.value != formik.values?.token){
                    await getDataToken(event.target.value);
                }
            };
            inputElement.addEventListener( 'blur', handleEvent );
            return () => inputElement.removeEventListener( 'blur', handleEvent );
        }

    }, [])

    useEffect(() => {
        let currentUrl = window.location.href;
        let urlObject = new URL(currentUrl);
        let token = urlObject.searchParams.get("token");
        if(token){
            getDataToken(token, true).then();
        }
    }, [])

    useEffect(() => {
        if(id){
            fetchData().then();
        }
    }, [id])

    const getDataToken = async (value: any, isActive = false) => {
        if(isPublic){
            await showLoading();
            try {
                const res = await APIClient.post('/collettia/client/' + value, null);
                if(res?.data?.data){
                    const data = res?.data?.data;
                    const c = {
                        ...client,
                        clientId: res?.data?.data?.clientId?.toString(),
                        userRef: data?.userRef,
                        feeText: data?.feeText,
                        address: data?.address,
                        cvr: data?.cvr,
                        phone: data?.phone,
                        email: data?.email,
                        token: value,
                        status: true
                    }
                    await setClient(c);
                }
            }catch (err){ }
            await hideLoading();
        }else{
            setClient({
                ...client,
                token: value,
            })
        }

    }

    const fetchData = async () => {
        await showLoading()
        try {
            const res = await APIClient.get("/users/" + id, true);
            if(res?.data?.data){
                const data = res?.data?.data;
                setClient(data);
            }
        }catch (err){}

        await hideLoading();
    }

    const prepareData = async () => {
        if(!getSession(SESSION.PREPARE_CLIENT)){
            const res = await APIClient.get('/client/prepare', true);
            if(res?.data?.data)
            {
                setSession(SESSION.PREPARE_CLIENT, JSON.stringify(res?.data?.data))
            }
        }
    }


    const handleLoginClient = async () => {
        await showLoading();
        try {
            const res = await APIClient.post('/authenticate', {
                userName: client?.clientId,
                password: client?.token,
                rememberMe: true
            });

            if(res?.data?.code === 1){
                await setSession(SESSION.CLIENT, JSON.stringify(res?.data?.data));
                history.push(ROUTE.client);
            }
        }catch (err){
            toast.error("Open client fail!", {
                position: "bottom-right",
                autoClose: 3000,
            })
        }
        await hideLoading();
    }

    return (
        <div className="py-4">
            {
                error && (
                    <div className="alert alert-danger" role="alert">
                        { error }
                    </div>
                )
            }
            <form className="card" onSubmit={formik.handleSubmit}>
                <div className="card-body">
                    <h2>Indstillinger</h2>
                    <div>
                        <div className="p-3 mb-2 df-bg-primary text-white">E-conomic information</div>
                        <div className="px-4">
                            <Input
                                disable={isPublic}
                                label={"Firma navn"}
                                name={'userRef'}
                                value={formik.values.userRef}
                                error={formik.errors?.userRef}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />

                            <Input
                                disable={isPublic}
                                label={"Telefon nr."}
                                name={'phone'}
                                value={formik.values.phone}
                                error={formik.errors?.phone}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />
                            <Input
                                disable={isPublic}
                                label={"Cvr"}
                                name={'phone'}
                                value={formik.values.cvr}
                                error={formik.errors?.cvr}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />
                            <Input
                                disable={isPublic}
                                label={"E-mail adresse"}
                                name={'email'}
                                value={formik.values.email}
                                error={formik.errors?.email}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />
                            <Input
                                disable={isPublic}
                                label={"Adresse"}
                                name={'address'}
                                value={formik.values.address}
                                error={formik.errors?.address}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />

                            {
                                id && (
                                    <div className="control-group mb-3 mt-3">
                                        <div
                                            className="form-check"
                                            onClick={() => { formik.setFieldValue("status", !formik.values?.status) }}
                                        >
                                            <input className="form-check-input" type="checkbox" value="" id="status" name="status"
                                                   checked={formik.values?.status} />
                                            <label className="form-check-label">
                                                Aktiv
                                            </label>
                                        </div>
                                    </div>
                                )
                            }

                        </div>
                    </div>
                    <div>
                        <div className="p-3 mb-2 df-bg-primary text-white">Bruger indstillinger</div>
                        <div className="px-4">
                            <p className="fw-bold">E-conomic</p>
                            {
                                !isPublic && (
                                    <p>
                                        {`Link for at få nøgle fra e-conomic: `}
                                        <a className="df-color-secondary" onClick={onOpenNewWindow}>Opret e-conomic nøgle</a>
                                    </p>
                                )
                            }
                            <div className="control-group mb-3 mt-3">
                                <label className="form-label" htmlFor="token">Token <span className="text-danger"> *</span></label>
                                <div className="controls">
                                    <input
                                        disabled={isPublic}
                                        id={"token"}
                                        ref={inputRef}
                                        className="form-control"
                                        type="text"
                                        placeholder=""
                                        name="token"
                                        value={formik.values?.token}
                                        onChange={formik.handleChange}
                                    />
                                    {
                                        formik.errors?.token ? (
                                            <span
                                                className="text-error field-validation-valid text-danger"
                                            >
                                                { formik.errors?.token }
                                            </span>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="px-4">
                            <p className="fw-bold">Collectia</p>
                            <Input
                                disable={isPublic}
                                label={"Her taster du dit Collectia kunde nr.:"}
                                name={'clientId'}
                                value={formik.values.clientId}
                                error={formik.errors?.clientId}
                                required
                                onChange={formik.handleChange}
                                placeholder={""}
                            />

                            {/*<Input*/}
                            {/*    label={"Her taster du dit Collectia Password:"}*/}
                            {/*    name={'password'}*/}
                            {/*    value={formik.values.password}*/}
                            {/*    error={formik.errors?.password}*/}
                            {/*    required*/}
                            {/*    onChange={formik.handleChange}*/}
                            {/*    placeholder={"Enter password"}*/}
                            {/*/>*/}
                        </div>
                    </div>
                    <div>
                        <div className="p-3 mt-4 df-bg-primary text-white">Andre indstillinger</div>
                        <div className="px-4">
                            <Input
                                label={"Tekst ved brug af rente i e-conomic:"}
                                name={'interestText'}
                                value={formik.values.interestText}
                                error={formik.errors?.interestText}
                                onChange={formik.handleChange}
                                placeholder={""}
                            />

                            <Input
                                label={"Tekst ved brug af gebyr i e-conomic:"}
                                name={'feeText'}
                                value={formik.values.feeText}
                                error={formik.errors?.feeText}
                                onChange={formik.handleChange}
                                placeholder={""}
                            />
                        </div>
                    </div>
                    {
                        id && (
                            <div>
                                <a className="df-color-secondary" onClick={handleLoginClient}>
                                    Klik her og og kopier link til e-conomic extra faneblad
                                </a>
                            </div>
                        )
                    }
                </div>
                <div className="card-footer">
                    <input type="hidden" defaultValue={0} name="Status" id="Status" />
                    <div className="d-flex justify-content-end gap-2 px-4">
                        <a className="btn btn-light" onClick={() => { history.push(ROUTE.user) }}>Annuller</a>
                        <button type="submit" className="btn btn-primary">Tilføj</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UserForm;
