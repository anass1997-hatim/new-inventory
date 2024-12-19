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
import {Link, Route, Routes} from "react-router-dom";
import Products from "./body/folders";
import UsePrinter from "./body/printer";

const sidebarItems = [
    { icon: FaHome, label: 'Accueil' , path: '/'},
    { icon: FaBox, label: 'Inventaire' },
    { icon: FaCalculator, label: 'Réappro Calcul' },
    { icon: FaBarcode, label: 'Sessions de Scan' },
    { icon: FaClipboardList, label: 'Commandes' },
    { icon: FaPrint, label: 'Impression' , path: '/Printer'},
    { icon: FaPrint, label: 'Impression V2' },
    { icon: FaBox, label: 'Produits' , path: '/Products' },
    { icon: FaMobileAlt, label: 'Actifs Mobiles' },
    { icon: FaMapMarkedAlt, label: 'Emplacements' },
    { icon: FaSignOutAlt, label: 'Déconnexion' },
];

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
                            <Route path="/Products" element={<Products/>}/>
                        </Routes>
                        <Routes>
                            <Route path="/Printer" element={<UsePrinter/>}/>
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
}
