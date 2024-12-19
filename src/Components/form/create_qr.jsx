import "../../CSS/label-print.css";
import Container from "react-bootstrap/Container";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";

export default function CreateQr({ printer, onBack }) {
    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Select
                                        name="size"
                                        className="category-select-folder"
                                    >
                                        <option value="">Taille</option>
                                        <option value="small">Petite</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="large">Grande</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nom"
                                        name="name"
                                        className="category-select-folder"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button">Effacer</Button>
                            <Button className="action-button">
                                <label htmlFor="file-upload" style={{ cursor: "pointer", margin: 0 }}>
                                    Enregistrer
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".xlsx, .xls"
                                    style={{ display: "none" }}
                                />
                            </Button>
                            <Button className="action-button">Enregistrer sous</Button>
                            <Button className="action-button" onClick={onBack}>
                                Retour
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="configuration-Qr">
                <div className="qr-maker-container">
                    <div className="qr-tools">
                        <button className="qr-tool-button">Texte</button>
                        <button className="qr-tool-button">Code-barres</button>
                        <button className="qr-tool-button">Symbole</button>
                        <button className="qr-tool-button">Forme</button>
                        <button className="qr-tool-button">Image</button>
                        <button className="qr-tool-button">Ajouter</button>
                        <button className="qr-tool-button">Supprimer le bloc</button>
                    </div>

                    <div className="qr-preview">
                        <div className="qr-design">
                            <input
                                type="text"
                                defaultValue="{Nom}"
                                className="qr-text-input"
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                    fontSize: "24px",
                                    border: "1px solid red",
                                    padding: "4px",
                                }}
                            />
                            <input
                                type="text"
                                defaultValue="{SKU}"
                                className="qr-text-input"
                                style={{
                                    position: "absolute",
                                    top: "50px",
                                    left: "10px",
                                    fontSize: "32px",
                                    border: "1px solid red",
                                    padding: "4px",
                                }}
                            />
                            <img
                                src="https://via.placeholder.com/100"
                                alt="QR Code"
                                style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "10px",
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="qr-edit-panel">
                        <div className="qr-edit-field">
                            <label>Données :</label>
                            <input type="text" placeholder="{SKU}" />
                        </div>
                        <div className="qr-edit-field">
                            <label>Rotation :</label>
                            <select>
                                <option>0°</option>
                                <option>90°</option>
                                <option>180°</option>
                                <option>270°</option>
                            </select>
                        </div>
                        <div className="qr-edit-field">
                            <label>Alignement du texte :</label>
                            <select>
                                <option>Gauche</option>
                                <option>Centre</option>
                                <option>Droite</option>
                            </select>
                        </div>
                        <div className="qr-edit-field">
                            <label>Taille de la police :</label>
                            <input type="number" defaultValue="24" />
                        </div>
                        <div className="qr-edit-field">
                            <label>Largeur :</label>
                            <input type="number" defaultValue="600" />
                        </div>
                        <div className="qr-edit-field">
                            <label>Hauteur :</label>
                            <input type="number" defaultValue="53" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
