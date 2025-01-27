import { useState } from "react";
import { Container, Row, Col, InputGroup, Form, Button, Nav } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import "../../CSS/shared.css";
import DisplayChampsData from "../data/data_champs";
import ChampForm from "../form/ajout_ChampsPersonnalises";

export default function AttributsTable() {
    const [filterText, setFilterText] = useState("");
    const [activeTab, setActiveTab] = useState("Produit");
    const [showChampForm, setShowChampForm] = useState(false);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleShowModal = () => setShowChampForm(true);
    const handleCloseModal = () => setShowChampForm(false);

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col>
                            <InputGroup className="search-input-group">
                                <Form.Control
                                    placeholder="Rechercher produits"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                                <Button><FaSearch /></Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={handleShowModal}
                            >
                                <FaPlus /> Ajouter
                            </Button>
                            <Button className="action-button"><FaFileImport /> Importer</Button>
                            <Button className="action-button"><FaFileExport /> Exporter</Button>
                            <Button className="action-button"><FaFileExcel /> Modèle</Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <ChampForm
                show={showChampForm}
                onHide={handleCloseModal}
            />

            <div className="products-tabs">
                <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange}>
                    <Nav.Item><Nav.Link eventKey="Produit">Produit</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="Dossier">Dossier</Nav.Link></Nav.Item>
                </Nav>
                <div className="tab-content mt-3">
                    {activeTab === "Produit" && <DisplayChampsData />}
                    {activeTab === "Dossier" && <div>Dossiers</div>}
                </div>
            </div>
        </>
    );
}