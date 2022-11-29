import React from 'react';
import './App.css';
import Routes from "./routes";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <ToastContainer />
            <div id="qloadder" className="qNone">
                <div className="spinner-border qloading" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            <Routes />
        </>
    );
}

export default App;
