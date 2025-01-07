import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/logo.jpg';
import {
    FaBell,
    FaBarcode,
    FaUserAlt,
    FaBox,
    FaCalculator,
    FaClipboardList,
    FaPrint,
    FaMobileAlt,
    FaMapMarkedAlt,
    FaHome,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import '../CSS/layout.css';
import {Link, Navigate, Route, Routes, useLocation} from "react-router-dom";
import UsePrinter from "./body/printer";
import Folders from "./body/folders";
import CreateQr from "./form/create_qr";
import UsePrinterV2 from "./body/printer_v2";
import Inventaire from "./inventaire/inventaire";
import Index from "./body";

const sidebarItems = [
    { icon: FaHome, label: 'Accueil' , path: '/'},
    { icon: FaBox, label: 'Inventaire', path: '/Inventaire' },
    { icon: FaCalculator, label: 'Réappro Calcul' },
    { icon: FaBarcode, label: 'Sessions de Scan' },
    { icon: FaClipboardList, label: 'Commandes' },
    { icon: FaPrint, label: 'Impression' , path: '/Printer'},
    { icon: FaPrint, label: 'Impression V2', path: '/PrinterV2' },
    { icon: FaBox, label: 'Produits' , path: '/Products' },
    { icon: FaMobileAlt, label: 'Actifs Mobiles' },
    { icon: FaMapMarkedAlt, label: 'Emplacements' },
    { icon: FaSignOutAlt, label: 'Déconnexion' },
];
const CreateQrWrapper = () => {
    const location = useLocation();
    const printer = location.state?.printer;
    if (!printer) {
        console.error("Printer data is missing");
        return <Navigate to="/Printer" replace />;
    }
    return <CreateQr printer={printer} />;
};

export default function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="layout">
            <Navbar expand="lg" className="main-navbar">
                <Container>
                    <div className="navbar-content-wrapper">
                        <Button
                            className="mobile-menu-toggle d-lg-none"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </Button>

                        <Navbar.Brand className="logo-title">
                            <span className="brand-logo">
                                <img src={logo} alt="logo" />
                            </span>
                        </Navbar.Brand>

                        <Navbar.Collapse
                            id="navbar-content"
                            className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`}
                        >
                            <div className="d-flex justify-content-between align-items-center button-group">
                                {[FaBarcode, FaBell, FaUserAlt].map((Icon, index) => (
                                    <Button
                                        key={index}
                                        className="navbar-options d-flex flex-column align-items-center"
                                    >
                                        <Icon />
                                        <span className="button-label">
                                            {['Scan', 'Notify', 'User'][index]}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </Navbar.Collapse>
                    </div>
                </Container>
            </Navbar>

            <div className="layout-content">
                <div
                    className={`sidebar ${isMenuOpen ? 'mobile-open' : ''}`}
                >
                    <ul className="sidebar-menu">
                        {sidebarItems.map(({icon: Icon, label, path}, index) => (
                            <li key={index} className="menu-item" onClick={() => setIsMenuOpen(false)}>
                                {path ? (
                                    <Link to={path} className="d-flex align-items-center">
                                        <Icon className="menu-icon"/>
                                        <span className="menu-label">{label}</span>
                                    </Link>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <Icon className="menu-icon"/>
                                        <span className="menu-label">{label}</span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={`content-area ${isMenuOpen ? 'sidebar-open' : ''}`}>
                    <div className="content-placeholder">
                        <Routes>
                            <Route path="/Products" element={<Folders/>}/>
                            <Route path="/" element={<Index/>}/>
                            <Route path="/Printer" element={<UsePrinter/>}/>
                            <Route path="/Printer/QrMaker" element={<CreateQrWrapper />} />
                            <Route path="/PrinterV2" element={<UsePrinterV2/>} />
                            <Route path="/Inventaire" element={<Inventaire />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
}
