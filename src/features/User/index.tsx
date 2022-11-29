import React, {useEffect, useRef, useState} from "react";
import {hideLoading, showLoading} from "../../helpers";
import {APIClient} from "../../helpers/api";
import Pagination from "../../components/Pagination";
import {useHistory} from "react-router-dom";
import {ROUTE} from "../../routes";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {toast} from "react-toastify";

const User = () => {
    const history = useHistory();
    const typingTimeoutRef: any = useRef(null);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paging, setPaging] = useState({
        pageCount: 0,
        pageIndex: 1,
        pageSize: 20,
        totalRecords: 0,
        search: ""
    })
    const [modal, setModal] = useState <any>({
        open: false,
        item: null
    });

    const fetchData = async () => {
        await showLoading();
        try {
            const res: any = await APIClient.get('/users', {
                search: paging?.search,
                page: paging.pageIndex,
                limit: paging.pageSize
            });
            if(res?.data?.data){
                await setUsers(Array.isArray(res?.data?.data?.items) ? res?.data?.data.items : []);
                await setPaging({
                    ...paging,
                    pageCount: res?.data?.data?.pageCount || 0,
                    pageIndex: res?.data?.data?.pageIndex || 1,
                    pageSize: res?.data?.data?.pageSize || 20,
                    totalRecords: res?.data?.data?.pageCount || 0,
                })
            }
        }catch (err){

        }

        setTimeout( async () => {
            await hideLoading()
            await setLoading(false);
        }, 500)
    }

    useEffect(() => {
        if(loading){
            fetchData().then();
        }
    }, [loading])

    const handleSearchTermChange = async (event : any, isEnter : boolean) => {
        setPaging({
            ...paging,
            search: event.target.value,
        })
        if(typingTimeoutRef.current){
            clearTimeout(typingTimeoutRef.current)
        }

        if(isEnter){
            await setPaging({
                ...paging,
                search: event.target.value,
                pageIndex: 1
            })
            await setLoading(true);
        }else{
            typingTimeoutRef.current = setTimeout( async () => {
                await setPaging({
                    ...paging,
                    search: event.target.value,
                    pageIndex: 1
                })
                await setLoading(true);

            }, 500)
        }
    }

    const handleCloseModal = () => {
        setModal({
            open: false,
            item: null,
        })
    }

    const handleOnDelete = async () => {
        await showLoading();
        try {
            const res = await APIClient.delete(`/users/${modal.item?.id}`, null);
            console.log('res', res?.data)
            if(res?.data?.code === 1){
                toast.success("Slet brugersucces", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
                setModal({open: false, item: null});
                setLoading(true);
            }
        }catch (err){
            toast.error("Slet bruger mislykkes", {
                position: "bottom-right",
                autoClose: 3000,
            })
        }

        setTimeout(() => {
            hideLoading();
        }, 500);
    }

    return (
        <div className="pb-3 container mt-3">
            <Modal
                show={modal.open}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Bekræftelse</Modal.Title>
                </Modal.Header>
                <Modal.Body>Er du sikker på at slette: { modal?.item?.userRef } ?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Lukke
                    </Button>
                    <Button variant="danger" onClick={handleOnDelete}>
                        Slette
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="row">
                <div className="col">
                    <a className="btn btn-primary" onClick={() => { history.push(ROUTE.createUser) }}><i className="fa-solid fa-plus"></i> Tilføj</a>
                </div>
                <div className="col">
                    <div className="input-group mb-3">
                        <input
                            value={paging.search}
                            id="searchClient"
                            name="search"
                            type="text"
                            className="form-control"
                            placeholder="Søg..."
                            onKeyPress={(e: any) => {
                                e.key === "Enter" && handleSearchTermChange(e, true)
                            }}
                            onChange={(event: any) => {
                                handleSearchTermChange(event, false);
                            }}

                        />
                        <span className="input-group-text">
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th className="text-center">#</th>
                        <th>Klient nummer</th>
                        <th>Firma</th>
                        <th>Cvr</th>
                        <th>Token</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        users?.map((item: any, index: number) => {
                            return (
                                <tr key={index}>
                                    <td className={"text-center"}>{ index + 1 }</td>
                                    <td>{item?.clientId}</td>
                                    <td>{ item?.userRef }</td>
                                    <td>{ item?.cvr }</td>

                                    <td>{ item?.token }</td>
                                    <td>
                                        <div>{ item?.status == 1 ? 'Aktiv' : 'Inactive' }</div>
                                    </td>

                                    <td>
                                        <a
                                            className="cursor"
                                            onClick={() => {
                                                history.push(`users/edit/${item.id}`)
                                            }}
                                        >Rediger </a>
                                        |
                                        <a
                                            className="text-danger"
                                            onClick={() => {
                                                setModal({ open: true, item : item})
                                            }}
                                        > Slet</a>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>

                <nav aria-label="float-end">
                    <Pagination
                        pageIndex={paging.pageIndex}
                        pageCount={paging.pageCount}
                        onChange={ async (page: number) => {
                            await setPaging({
                                ...paging,
                                pageIndex: page,
                            })
                            await setLoading(true);
                        }}
                    />
                </nav>
            </div>
        </div>
    )
}

export default User;
