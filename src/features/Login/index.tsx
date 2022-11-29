import React from "react";
import Input from "../../components/base/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import {APIClient} from "../../helpers/api";
import {hideLoading, setSession, showLoading} from "../../helpers";
import {ROLE, SESSION} from "../../helpers/constant";
import {useHistory} from "react-router-dom";
import {ROUTE} from "../../routes";

const Login = () => {
    const history = useHistory();

    const formik: any = useFormik({
        initialValues: {
            userName: 'admin',
            password: '123456',
            rememberMe: true
        },
        validationSchema: Yup.object().shape({
            userName: Yup.string().required("Bruger er et obligatorisk felt"),
            password: Yup.string().required("Password er et obligatorisk felt"),

        }),
        onSubmit: async (values) => {
            await showLoading();
            try {
                const res: any = await APIClient.post('/authenticate', values, false);
                if(res?.data?.data){
                    if(res?.data?.data?.role?.includes(ROLE.ADMIN)){
                        await setSession(SESSION.USER, JSON.stringify(res?.data?.data));
                        history.push(ROUTE.user);
                    }else{
                        await setSession(SESSION.CLIENT, JSON.stringify(res?.data?.data));
                        history.push(ROUTE.client);
                    }
                }
            }catch (err: any){
                if(err?.data?.code === -1){
                    formik.setFieldError("userName", err?.data?.message);
                }
            }

            await setTimeout(() => {
                hideLoading();
            }, 300)
        }
    })

    return (
        <div className="container">
            <main role="main" className="pb-3 container mt-3">
                <div className="container-fluid">
                    <form onSubmit={formik.handleSubmit}>
                        <Input
                            name={'userName'}
                            value={formik.values.userName}
                            onChange={formik.handleChange}
                            error={formik.errors?.userName}
                            label={'Bruger'}
                            required
                        />
                        <Input
                            type={'password'}
                            name={'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.errors?.password}
                            label={'Password'}
                            required
                        />

                        <div className="control-group">
                            <div className="controls">
                                <button type="submit" className="btn btn-primary">Log ind</button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default Login;
