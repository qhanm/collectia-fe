import React from "react";
import {RouteInterface} from "./interface";
import { Switch, Route } from "react-router-dom";
import Login from "../features/Login";
import PublicTemplate from "../templates/PublicTemplate";
import User from "../features/User";
import AdminTemplate from "../templates/AdminTemplate";
import Client from "../features/Client";
import EditUser from "../features/EditUser";
import CreateUser from "../features/CreateClient";
import ClientTemplate from "../templates/ClientTemplate";
import EconomicPlus from "../features/EconomicPlus";
import ClientLogin from "../features/ClientLogin";

export const ROUTE = {
    login: '/admin',
    user: '/',
    editUser: '/users/edit/:id',
    createUser: '/users/create',
    client: '/client',
    economicPlus: '/economic-plus',
    clientLogin: '/login'
}

const publicRoutes: Array<RouteInterface> = [
    { path: ROUTE.login, Component: Login },
    { path: ROUTE.clientLogin, Component: ClientLogin },
    { path: ROUTE.createUser, Component: CreateUser },
    { path: ROUTE.economicPlus, Component: EconomicPlus },

]

const adminRoutes: Array<RouteInterface> = [
    { path: ROUTE.user, Component: User },
    { path: ROUTE.editUser, Component: EditUser },

]

const clientRoute: Array<RouteInterface> = [
    { path: ROUTE.client, Component: Client },
]

const Routes = () => {

    const availablePublicRoutesPaths : Array<string>|any = publicRoutes.map((r: RouteInterface) => r.path);
    const availableAdminRoutePaths: Array<string>|any = adminRoutes.map((r: RouteInterface) => r.path);
    const availableClientRoutePaths: Array<string>|any = clientRoute.map((r: RouteInterface) => r.path);

    return (
        <React.Fragment>
            <Switch>
                <Route path={availablePublicRoutesPaths}>
                    <PublicTemplate>
                        <Switch>
                            {publicRoutes.map((route : RouteInterface|any, idx : number) => {
                                return (
                                    <Route
                                        path={route.path}
                                        component={route.Component}
                                        key={idx}
                                        exact={true}
                                    />
                                )
                            })}
                        </Switch>
                    </PublicTemplate>
                </Route>
                <Route path={availableClientRoutePaths}>
                    <ClientTemplate>
                        <Switch>
                            {clientRoute.map((route : RouteInterface|any, idx : number) => {
                                return (
                                    <Route
                                        path={route.path}
                                        component={route.Component}
                                        key={idx}
                                        exact={true}
                                    />
                                )
                            })}
                        </Switch>
                    </ClientTemplate>
                </Route>
                <Route path={availableAdminRoutePaths}>
                    <AdminTemplate>
                        <Switch>
                            {adminRoutes.map((route : RouteInterface|any, idx : number) => {
                                return (
                                    <Route
                                        path={route.path}
                                        component={route.Component}
                                        key={idx}
                                        exact={true}
                                    />
                                )
                            })}
                        </Switch>
                    </AdminTemplate>
                </Route>
            </Switch>

        </React.Fragment>
    )
}

export default Routes;
