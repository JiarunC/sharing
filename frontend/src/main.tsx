/*
 * main.tsx
 * template from React + vite
 * with router
 */


import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import Tiles from './pages/Tiles.tsx'
import {Flip, ToastContainer} from "react-toastify";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <><StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/tiles" element={<Tiles/>}/>
            </Routes>
        </BrowserRouter>
    </StrictMode>
        <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Flip}/></>
);
