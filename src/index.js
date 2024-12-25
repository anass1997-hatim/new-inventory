import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

const Layout = lazy(() => import("./Components/main"));
const Index = lazy(() => import("./Components/body"));
const Folders = lazy(() => import("./Components/body/folders"));
const UsePrinter = lazy(() => import("./Components/body/printer"));
const CreateQr = lazy(() => import("./Components/form/create_qr"));
const UsePrinterV2 = lazy(() => import("./Components/body/printer_v2"));

const CreateQrWrapper = () => {
    const location = useLocation();
    const printer = location.state?.printer || { type: "EMPTY", value: "" };

    if (!printer) {
        return (
            <div>
                <p>No printer data provided. Please select a printer first.</p>
                <a href="/Printer">Go back to printer selection</a>
            </div>
        );
    }

    return <CreateQr printer={printer} />;
};

const App = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    <Route path="*" element={<Layout />}>
                        <Route index element={<Index />} />
                        <Route path="Products" element={<Folders />} />
                        <Route path="Printer" element={<UsePrinter />} />
                        <Route path="Printer/QrMaker" element={<CreateQrWrapper />} />
                        <Route path="PrinterV2" element={<UsePrinterV2 />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />)
