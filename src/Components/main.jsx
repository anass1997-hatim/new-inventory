import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/logo.jpg';
import {
    FaBell,
    FaBarcode,
    FaSearch,
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

const sidebarItems = [
    { icon: FaHome, label: 'Accueil' },
    { icon: FaBox, label: 'Inventaire' },
    { icon: FaCalculator, label: 'Réappro Calcul' },
    { icon: FaBarcode, label: 'Sessions de Scan' },
    { icon: FaClipboardList, label: 'Commandes' },
    { icon: FaPrint, label: 'Impression' },
    { icon: FaPrint, label: 'Impression V2' },
    { icon: FaBox, label: 'Produits' },
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
                            <Form className="search-form d-flex justify-content-center w-100 my-2 my-lg-0">
                                <div className="search-wrapper">
                                    <Form.Control
                                        type="search"
                                        placeholder="Rechercher"
                                        className="me-2"
                                        aria-label="Search"
                                    />
                                    <Button className="navbar-search">
                                        <FaSearch />
                                    </Button>
                                </div>
                            </Form>
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
                        {sidebarItems.map(({ icon: Icon, label }, index) => (
                            <li
                                key={index}
                                className="menu-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }}
                            >
                                <Icon className="menu-icon" />
                                <span className="menu-label">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`content-area ${isMenuOpen ? 'sidebar-open' : ''}`}>
                    <div className="content-placeholder">
                        <div className="instructions">
                            <h2>Bienvenue sur RFID Inventaire</h2>
                            <p>Optimisez la gestion de votre inventaire grâce à la technologie RFID. Voici quelques conseils : </p>
                            <ul>
                                <li>Utilisez le menu latéral pour accéder aux modules : Inventaire, Scan, et Rapports.</li>
                                <li>Cliquez sur "Scan" pour démarrer une session RFID.</li>
                                <li>Recherchez vos articles via la barre en haut.</li>
                            </ul>
                            <p>Besoin d'aide ? Consultez le manuel ou contactez le support.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
