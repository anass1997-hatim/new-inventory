import { useState } from "react";
import { Container, Row, Col, InputGroup, Form, Button, Nav } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "../../CSS/shared.css";

export default function AttributsTable() {
    const [filterText, setFilterText] = useState("");
    const [activeTab, setActiveTab] = useState("Produit");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

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
                    </Row>
                </Container>

            </div>

            <div className="products-tabs">
                <Nav
                    variant="tabs"
                    activeKey={activeTab}
                    onSelect={handleTabChange}
                >
                    <Nav.Item><Nav.Link eventKey="Produit">Produit</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="Dossier">Dossier</Nav.Link></Nav.Item>
                </Nav>
                <div className="tab-content mt-3">
                    {activeTab === "Produit" && <div>
                        <p>
                            Produits
                        </p>

                    </div>
                    }
                    {activeTab === "Dossier" && <div>
                        <p>
                            Dossiers
                        </p>

                    </div>
                    }
                </div>
            </div>
        </>
    );
}
