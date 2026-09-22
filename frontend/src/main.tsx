import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import Tiles from './pages/Tiles.tsx'


ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/tiles" element={<Tiles />}/>
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
