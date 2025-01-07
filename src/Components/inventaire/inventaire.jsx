import '../../CSS/inventaire.css';
import { Dropdown, InputGroup, Nav } from "react-bootstrap";
import { FaFileArchive, FaFileExport, FaRegCalendarAlt } from "react-icons/fa";
import { useState } from "react";

export default function Inventaire() {
    const [activeTab, setActiveTab] = useState("verified");

    const handleTabChange = (selectedTab) => {
        setActiveTab(selectedTab);
    };

    return (
        <div className="inventaire-wrapper">
            <div className="inventaire">
                <div className="printer-v2-search-input-dropdowns">
                    <InputGroup className="printer-v2-search-input">
                        <InputGroup.Text className="icon-prod-v2">Dossiers</InputGroup.Text>
                        <Dropdown>
                            <Dropdown.Toggle className="printer-v2-dropdown">Sélectionner Dossiers</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="#/dossier-1">Dossier 1</Dropdown.Item>
                                <Dropdown.Item href="#/dossier-2">Dossier 2</Dropdown.Item>
                                <Dropdown.Item href="#/dossier-3">Dossier 3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </InputGroup>
                </div>

                <div className="printer-v2-search-input-dropdowns">
                    <InputGroup className="printer-v2-search-input">
                        <InputGroup.Text className="icon-prod-v2">Emplacement</InputGroup.Text>
                        <Dropdown>
                            <Dropdown.Toggle className="printer-v2-dropdown">Sélectionner Emplacement</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="#/emplacement-1">Emplacement 1</Dropdown.Item>
                                <Dropdown.Item href="#/emplacement-2">Emplacement 2</Dropdown.Item>
                                <Dropdown.Item href="#/emplacement-3">Emplacement 3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </InputGroup>
                </div>

                <div className="inventaire-buttons">
                    <button>
                        <FaFileArchive style={{ marginRight: "5px" }} />
                        inventaire d'archives
                    </button>
                    <button>
                        <FaFileExport style={{ marginRight: "5px" }} />
                        Exporter les archives
                    </button>
                </div>
            </div>
            <div className="scan-date">
                <p>Ajouter Last Scan: 26/12/2024 <FaRegCalendarAlt style={{ marginLeft: '5px' }} /></p>
            </div>


                <div className="products-tabs">
                    <Nav
                        variant="tabs"
                        activeKey={activeTab}
                        onSelect={(eventKey) => handleTabChange(eventKey)}
                        className="justify-content-between"
                    >
                        <div className="d-flex">
                            <Nav.Item>
                                <Nav.Link eventKey="verified">Produits Vérifiés</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="absent">Produits Absents</Nav.Link>
                            </Nav.Item>
                        </div>
                    </Nav>
                    <div className="tab-content mt-3">
                        {activeTab === "verified" && <div>Liste des Produits Vérifiés</div>}
                        {activeTab === "absent" && <div>Liste des Produits Absents</div>}
                    </div>
                </div>
        </div>
    );
}
