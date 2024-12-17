import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from "./Components/main";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Index from "./Components/body";
import Products from "./Components/body/products";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Layout />
        <Routes>
            <Route path="/" element={<Index/>}/>
            <Route path="/Products" element={<Products/>}/>
        </Routes>
    </BrowserRouter>




);


