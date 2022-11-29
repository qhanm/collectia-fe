import React, { useState } from "react";
import styles from "../index.module.css";
import {useHistory} from "react-router-dom";
import {SESSION} from "../../helpers/constant";
import {ROUTE} from "../../routes";
import { getSession, hideLoading, showLoading } from "../../helpers";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Input from "../../components/base/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api";
import { toast } from "react-toastify";

interface Props {
    isChangePass?: boolean,
}

const Header: React.FC<Props> = ({ isChangePass }) => {

    const history = useHistory();
    const user = getSession(SESSION.USER, true);
    const client = getSession(SESSION.CLIENT, true);

    const [modal, setModal] = useState <any>({
        open: false,
        item: null
    });

    const handleCloseModal = () => {
        setModal({
            open: false,
            item: null,
        })
    }

    const formik: any = useFormik({
        initialValues: {
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object().shape({
            password: Yup.string().required('Adgangskode er påkrævet'),
            newPassword: Yup.string().required("Ny adgangskode er påkrævet"),
            confirmPassword: Yup.string().required("Bekræft, at adgangskoden er påkrævet").oneOf([Yup.ref('newPassword'), null], 'Adgangskoden skal stemme overens')
        }),
        onSubmit: async (values: any) => {
            await showLoading();
            let isShowError = "";
            try{
                const res = await APIClient.post("/users/change-password", values);

                if(res?.data?.code == 1){
                    toast.success(res?.data?.message, {
                        position: "bottom-right",
                        autoClose: 3000,
                    })
                    setModal({ open: false, item: null });
                    sessionStorage.removeItem(SESSION.CLIENT);
                    sessionStorage.removeItem(SESSION.USER);
                    history.push(ROUTE.login);
                }else{
                    isShowError = res?.data?.message;
                }
            }catch(err: any) {
                isShowError = err?.data?.message;

            }

            if(isShowError){
                toast.error(isShowError, {
                    position: "bottom-right",
                    autoClose: 3000,
                })
            }

            setTimeout(() => {
                hideLoading();
            }, 500)
        }
    })

    return (
        <nav className="">
            <Modal
                show={modal.open}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Ændre password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Input
                        type="password"
                        label={"Kodeord"}
                        value={formik.values?.password}
                        name="password"
                        required
                        onChange={formik.handleChange}
                        error={formik.errors?.password}
                    />
                    <Input
                        type="password"
                        label={"Ny adgangskode"}
                        value={formik.values?.newPassword}
                        name="newPassword"
                        required
                        onChange={formik.handleChange}
                        error={formik.errors?.newPassword}
                    />
                    <Input
                        type="password"
                        label={"Bekræft adgangskode"}
                        value={formik.values?.confirmPassword}
                        name="confirmPassword"
                        required
                        onChange={formik.handleChange}
                        error={formik.errors?.confirmPassword}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Lukke
                    </Button>
                    <Button variant="success" onClick={formik.handleSubmit}>
                        Forandre
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="container d-flex justify-content-between gap-3 p-1 border-bottom border-secondary">
                <div className="d-flex justify-content-start">
                    <a href="/">
                        <img src="../../logo.png" className={styles.header} />
                    </a>
                    <a className={"navbar-brand " + styles.headerText}>Inkasso direkte fra e-conomic</a>
                </div>
                <div
                    className="d-flex gap-3"
                >
                    {
                        user?.role?.includes("Admin") && isChangePass ? (
                            <a
                                onClick={() => { setModal({ open: true, item: null }) }}
                                className={"navbar-brand mr-2 " + styles.logout}
                            >
                                Ændre password
                            </a>
                        ) : null

                    }
                    {
                        (user || client) && (
                            <a
                                className={"navbar-brand " + styles.logout}
                                onClick={() => {
                                    sessionStorage.removeItem(SESSION.USER);
                                    sessionStorage.removeItem(SESSION.CLIENT);

                                    if(user){
                                        history.push(ROUTE.login);
                                    }else if(client){
                                        history.push(ROUTE.clientLogin);
                                    }
                                }}
                            >Log ud</a>
                        )
                    }
                </div>

            </div>
        </nav>
    )
}

export default Header;
