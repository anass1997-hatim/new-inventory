import '../../CSS/products.css';
import Container from "react-bootstrap/Container";
import { Col, InputGroup, Nav, Row, Dropdown} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import { useState } from "react";
import DisplayProductData from '../data/product_data';
import ProductForm from "../form/add_product";

export default function Products() {
    const [activeTab, setActiveTab] = useState('Active');
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleTabSelect = (eventKey) => setActiveTab(eventKey);

    const handleClose = () => setShowOffcanvas(false);
    const handleShow = () => setShowOffcanvas(true);

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col>
                            <InputGroup className="search-input-group">
                                <Form.Control
                                    placeholder="Rechercher produits"
                                    aria-label="Search products"
                                    aria-describedby="button-addon2"
                                />
                                <Button variant="primary" id="button-addon2" title="Search">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button" onClick={handleShow}>
                                <FaPlus /> Ajouter
                            </Button>
                            <Button className="action-button">
                                <FaFileImport /> Importer
                            </Button>
                            <Button className="action-button">
                                <FaFileExport /> Exporter
                            </Button>
                            <Button className="action-button">
                                <FaFileExcel /> Modèle
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="products-tabs">
                <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabSelect} className="justify-content-between">
                    <div className="d-flex">
                        <Nav.Item>
                            <Nav.Link eventKey="Active">Active</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Inactive">Inactive</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Draft">Draft</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Unknown">Unknown</Nav.Link>
                        </Nav.Item>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="dropdown-filter">
                            <h4>Entreprise</h4>
                        </div>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="tab-dropdown">
                                Options 1
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="tab-dropdown-items">
                                <Dropdown.Item>Option 1-1</Dropdown.Item>
                                <Dropdown.Item>Option 1-2</Dropdown.Item>
                                <Dropdown.Item>Option 1-3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <div className="dropdown-filter">
                            <h4>Fournisseur</h4>
                        </div>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="tab-dropdown">
                                Options 2
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="tab-dropdown-items">
                                <Dropdown.Item>Option 2-1</Dropdown.Item>
                                <Dropdown.Item>Option 2-2</Dropdown.Item>
                                <Dropdown.Item>Option 2-3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Nav>

                <div className="tab-content mt-3">
                    {activeTab === 'Active' && <DisplayProductData />}
                    {activeTab === 'Inactive' && <div>Inactive Content</div>}
                    {activeTab === 'Draft' && <div>Draft Content</div>}
                    {activeTab === 'Unknown' && <div>Unknown Content</div>}
                </div>
            </div>


            <ProductForm show={showOffcanvas} onHide={handleClose} placement="end"/>

        </>
    );
}
