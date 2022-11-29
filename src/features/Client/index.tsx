import React, {useEffect, useState, useRef} from "react";
import {getSession, hideLoading, setSession, showLoading} from "../../helpers";
import {APIClient, setAuthorization} from "../../helpers/api";
import Select from 'react-select'
import moment from "moment";
import {ROLE, SESSION} from "../../helpers/constant";
import {ROUTE} from "../../routes";
import {useHistory} from "react-router-dom";

const Client = () => {
    const history: any = useHistory();
    const typingTimeoutRef: any = useRef(null);
    const [customers, setCustomers] = useState([]);
    const [customerSelected, setCustomerSelected] = useState <any>(null);
    const [entries, setEntries] = useState([]);
    const [entryChecked, setEntryChecked] = useState <Array<any>>([]);
    const [comment, setComment] = useState("");
    const [error, setError] = useState <any>("");
    const [success, setSuccess] = useState <any>("");
    const [search, setSearch] = useState <string>("");
    const [searchTemp, setSearchTemp] = useState<string>("");
    const [showTooltip, setShowTooltip] = useState(false);

    const fetchData = async () => {
        await showLoading();

       try {
           let currentUrl = window.location.href;
           let urlObject = new URL(currentUrl);
           let token = urlObject.searchParams.get("token");
           let clientId =  urlObject.searchParams.get("clientId");

           if(token && clientId){
               const  loginRes = await APIClient.post('/authenticate', {
                   userName: clientId,
                   password: token,
                   rememberMe: true
               }, false);

               if(loginRes?.data?.data){
                   setSession(SESSION.CLIENT, JSON.stringify(loginRes?.data?.data));
                   setAuthorization(loginRes?.data?.data?.token);
               }else{
                   sessionStorage.removeItem(SESSION.CLIENT)
                   history.push(ROUTE.clientLogin);
               }
           }else{
               history.push(ROUTE.clientLogin);
           }
       }catch (err){ }

        try {
            const resCus = await APIClient.get('/economic/customers', null, true);
            let item : any = null;
            if(Array?.isArray(resCus?.data?.data)){
                item = resCus?.data?.data[0];
                await setCustomerSelected({
                    ...item,
                    label: item?.name,
                    value: item?.customerNumber,
                });

                await setCustomers(resCus?.data?.data?.map((cus: any) => ({
                    ...cus,
                    label: cus?.name,
                    value: cus?.customerNumber
                })))
            }

            if(item){
                const resEntries = await APIClient.get(`/economic/entries/${item?.customerNumber}`, true);

                if(Array.isArray(resEntries?.data?.data)){
                    await setEntries(resEntries?.data?.data);
                }
            }

        }catch (err){

        }

        await hideLoading();
    }

    useEffect(() => {
        fetchData().then();
    }, [])

    const handleSendEntries = async () => {
        await showLoading();
        try {
            if(entryChecked?.length){
                const res = await APIClient.post('/collecttia/case', {
                    comment: comment,
                    entries: entryChecked,
                    customerNumber: customerSelected.customerNumber,
                }, true);

                if(res?.data?.code === 1){
                    setError("");
                    setSuccess(res?.data?.message);
                }
            }else {
                setError("Vælg venligst poster");
                setSuccess("");
            }
        }catch (err: any){
            setError(err?.data?.message);
            setSuccess("");
        }
        await hideLoading();
    }

    const handleSearchTermChange = async (event : any, isEnter : boolean) => {
        setSearchTemp(event.target.value);
        if(typingTimeoutRef.current){
            clearTimeout(typingTimeoutRef.current)
        }

        if(isEnter){
            setSearch(event.target.value);
        }else{
            typingTimeoutRef.current = setTimeout( async () => {
                setSearch(event.target.value);
            }, 500)
        }
    }

    const getArrContentEntries = () => {
        const filterData = entries?.filter((item: any) => {
            const date = moment(item?.date).format("DD-MM-YYYY");
            const dueDate = moment(item?.dueDate).format("DD-MM-YYYY");
            if(
                item?.text?.includes(search)
                || item?.account?.accountNumber?.toString()?.includes(search)
                || item?.remainder?.toString()?.includes(search)
                || item?.invoiceNumber?.includes(search)
                || item?.entryType?.includes(search)
                || date?.includes(search)
                || dueDate?.includes(search)

            ){
                return item;
            }
        })

        return filterData;
    }

    const clientInfo = getSession(SESSION.CLIENT, true);

    return (
        <div className="pt-3">
            <div className="row">
                <div className="col-md-12">
                <div className="alert alert-success" role="alert">
                    Welcome <span style={{textDecoration:'underline'}}>{ clientInfo?.user?.company }</span>, CVR: <span style={{textDecoration:'underline'}}>{ clientInfo?.user?.cvr }</span>, Klient nummer: <span style={{textDecoration:'underline'}}>{ clientInfo?.user?.username }</span>
                </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 col-lg-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Kunde</label>
                    <Select
                        options={customers}
                        value={customerSelected}
                        onChange={ async (event: any) => {
                            await setCustomerSelected(event);
                            await showLoading();
                            const resEntries = await APIClient.get(`/economic/entries/${event?.customerNumber}`, true);

                            if(Array.isArray(resEntries?.data?.data)){
                                await setEntries(resEntries?.data?.data);
                            }

                            await setEntryChecked([]);
                            await setError("");
                            await setSuccess("");
                            await hideLoading();
                        }}
                    />
                </div>
                <div className="col-md-12 offset-lg-6 col-lg-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Søg</label>

                    <div className="input-group mb-3">
                        <input
                            value={searchTemp}
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
                        <span className="input-group-text" id="basic-addon1">
                            <i className="fa fa-search" aria-hidden="true"></i>
                        </span>
                    </div>
                </div>
            </div>

            <div className="">
                {
                    error && (
                        <div className="alert alert-danger">
                            { error }
                        </div>
                    )
                }
                {
                    success && (
                        <div className="alert alert-success">
                            { success }
                        </div>
                    )
                }
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        <th>Debitor</th>
                        <th>Debitor nr.</th>
                        <th>Beløb</th>
                        <th>Faktura nr.</th>
                        <th>Faktura tekst</th>
                        <th>Type</th>
                        <th>Dato</th>
                        <th>Forfaldsdato</th>
                        <th className="text-center">Vælg</th>
                    </tr>
                    </thead>
                    <tbody id="tblEntryBody">
                    {
                        getArrContentEntries()?.map((entry: any, index: number) => {

                            return (
                                <tr key={index}>
                                    <td>{ customerSelected?.label }</td>
                                    <td>{ entry?.account?.accountNumber }</td>
                                    <td>{ entry?.remainder }</td>
                                    <td>{ entry?.invoiceNumber }</td>
                                    <td>{ entry?.text }</td>
                                    <td>{ entry?.entryType }</td>
                                    <td>{ entry?.date && moment(entry?.date).format("DD-MM-YYYY") }</td>
                                    <td>{ entry?.dueDate && moment(entry?.dueDate).format("DD-MM-YYYY") }</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            name="entries[]"
                                            className="form-check-input"
                                            onClick={() => {
                                                const lstChecked = [...entryChecked];
                                                const checkIndex = lstChecked.findIndex((item: any) => item.entryNumber === entry.entryNumber);
                                                if(checkIndex === -1) lstChecked.push(entry);
                                                else lstChecked.splice(checkIndex, 1);

                                                setEntryChecked(lstChecked);

                                            }}
                                        />
                                    </td>
                                </tr>
                            )
                        } )
                    }
                    </tbody>
                </table>

            </div>
            <div className="row">
                <div className="col-md-12">
                    <div>
                        <label htmlFor="" className="mb-2">
                            Stævningstekst (Beskriv kort og dækkende leverancen/ydelsen (f.eks. ”Levering af …..”, ”Montage af …..”, ”Reparation af…..” m.v.)”:

                        </label>
                        <div className="d-flex align-items-center gap-2">
                            <input
                                type="text"
                                name="comment"
                                className="form-control w-50"
                                onChange={(e: any) => {
                                    setComment(e.target.value);
                                }}
                            />
                            <i
                                className="fa-solid fa-question"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title='Du skal kort og dækkende skrive, hvad du har penge til gode for – altså beskrive den leverance/ydelse, som ligger til grund for det skyldige beløb. Forestil dig, at din beskrivelse kommer i forlængelse af ordene ”Gælden vedrører……..”, når vi skriver til debitor, og debitor skal kunne genkende, hvad pengene skyldes for.'>

                            </i>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="d-flex justify-content-end align-items-center gap-2 mt-2">
                        <div className="">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                            Er der sendt inkassovarsel med 10 dages betalingsfrist, samt varslet om yderligere omkostninger?
                                <input type="checkbox" className="form-check-input"/>
                                <div
                                    className="position-relative"
                                    onMouseMove={() => { setTimeout(() => setShowTooltip(true), 400) }}
                                    onClick={() => { setTimeout(() => setShowTooltip(true), 400) }}
                                    onMouseLeave={() => { setTimeout(() => setShowTooltip(!showTooltip), 400) }}
                                >
                                    <i className="fa-solid fa-question">

                                    </i>
                                    {
                                        showTooltip && (
                                            <>
                                                <div style={{display: 'inline', position: 'absolute', right: '100%', width: '350px', backgroundColor: 'rgb(255, 255, 204)', border: '1px solid black', padding: '2px', fontSize: '10px'}}>
                                       
                                                    <span>!For at kunne sende en sag til inkasso, skal der sendes et lovpligtigt inkassovarsel. Inkassovarslet skal indholde følgende:</span>
                                                    <br /><br />
                                                    <div>
                                                        <span>1. En betalingsfrist på mindst 10 dage </span>
                                                    </div>
                                                    <div>
                                                        <span>2. Varsling om manglende betaling vil påføre debitor yderligere omkostninger!</span>
                                                    </div>
                                                 </div>
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="d-flex justify-content-end align-items-center gap-2">
                            Er der indsigelser / strid i sagen?
                                <input type="checkbox" className="form-check-input"/>
                                <i className="fa-solid fa-question" data-bs-toggle="tooltip" data-bs-placement="top"
                                   title='Hvis debitor har protesteret, er der tale om en "indsigelse", kravet er "bestridt", og der foreligger en "tvist". Enhver form for uenighed om kravet, uanset om det er mundligt eller skriftligt, er en tvist. Selv en helt åbenlyst urimelig protest er en indsigelse, og vi skal have besked om den ved sagens start.'></i>
                            </div>
                        </div>
                        <div className="">
                            <button
                                type="button"
                                className="btn df-bg-primary text-light" id="btnSendEntries"
                                onClick={handleSendEntries}
                            >
                                Send til inkasso
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Client;
