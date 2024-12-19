import '../../CSS/folders.css';
import Container from "react-bootstrap/Container";
import { Col, InputGroup, Nav, Row, Modal, Form, Button, Table } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import { useReducer } from "react";
import DisplayProductData from '../data/folder_data';
import ProductForm from "../form/add_folder";
import * as XLSX from "xlsx";

const expectedFields = [
    "Identifiant",
    "Type",
    "Titre",
    "Catégorie",
    "Code-barres",
    "Emplacement",
    "Mots-clés",
    "Date de création"
];

const initialState = {
    activeTab: 'Active',
    showOffcanvas: false,
    uploadedData: [],
    parsedData: [],
    validationSummary: [],
    showModal: false
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        case 'TOGGLE_OFFCANVAS':
            return { ...state, showOffcanvas: action.payload };
        case 'SET_UPLOADED_DATA':
            return { ...state, uploadedData: action.payload };
        case 'SET_PARSED_DATA':
            return { ...state, parsedData: action.payload };
        case 'SET_VALIDATION_SUMMARY':
            return { ...state, validationSummary: action.payload };
        case 'TOGGLE_MODAL':
            return { ...state, showModal: action.payload };
        case 'RESET_IMPORT_DATA':
            return {
                ...state,
                parsedData: [],
                validationSummary: [],
                showModal: false
            };
        default:
            return state;
    }
};

export default function Folders() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateExcelData = (data) => {
        const errors = [];
        const headers = Object.keys(data[0]).filter((header) => header !== "Image");

        const missingFields = expectedFields.filter((field) => !headers.includes(field));
        const extraFields = headers.filter((header) => !expectedFields.includes(header));

        if (missingFields.length > 0) {
            errors.push(`Les champs suivants sont manquants : ${missingFields.join(", ")}`);
        }
        if (extraFields.length > 0) {
            errors.push(`Les champs suivants sont supplémentaires : ${extraFields.join(", ")}`);
        }

        let missingFieldCounts = {};
        data.forEach((row) => {
            expectedFields.forEach((field) => {
                if (!row[field] || row[field].toString().trim() === "") {
                    missingFieldCounts[field] = (missingFieldCounts[field] || 0) + 1;
                }
            });
        });

        if (Object.keys(missingFieldCounts).length > 0) {
            const fieldSummary = Object.entries(missingFieldCounts)
                .map(([field, count]) => `${field} (${count} ligne${count > 1 ? "s" : ""})`)
                .join(", ");
            errors.push(`Certains champs sont vides : ${fieldSummary}`);
        }

        dispatch({ type: 'SET_VALIDATION_SUMMARY', payload: errors.slice(0, 5) });
        return errors.length === 0;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target.result instanceof ArrayBuffer) {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    dispatch({ type: 'SET_PARSED_DATA', payload: jsonData });
                    validateExcelData(jsonData);
                    dispatch({ type: 'TOGGLE_MODAL', payload: true });
                } else {
                    console.error("Invalid file type or file could not be processed.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.error("No file selected or invalid file.");
        }
    };

    const handleConfirmImport = () => {
        dispatch({ type: 'SET_UPLOADED_DATA', payload: state.parsedData });
        dispatch({ type: 'TOGGLE_MODAL', payload: false });
    };

    const handleCancelImport = () => {
        dispatch({ type: 'RESET_IMPORT_DATA' });
    };

    const handleExportData = () => {
        const worksheet = XLSX.utils.json_to_sheet(state.uploadedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dossiers");
        XLSX.writeFile(workbook, "exported_data.xlsx");
    };

    const handleDownloadExample = () => {
        const exampleData = [
            {
                Identifiant: "12345",
                Type: "Produit",
                Titre: "Exemple Titre",
                Catégorie: "Exemple Catégorie",
                "Code-barres": "123456789",
                Emplacement: "Exemple Emplacement",
                "Mots-clés": "Exemple, Clé",
                "Date de création": "2024-01-01"
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(exampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exemple");
        XLSX.writeFile(workbook, "example_products.xlsx");
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
                                    aria-label="Search products"
                                    aria-describedby="button-addon2"
                                />
                                <Button variant="primary" id="button-addon2" title="Search">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={() => dispatch({ type: 'TOGGLE_OFFCANVAS', payload: true })}
                            >
                                <FaPlus /> Ajouter
                            </Button>
                            <Button className="action-button">
                                <label htmlFor="file-upload" style={{ cursor: "pointer", margin: 0 }}>
                                    <FaFileImport /> Importer
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".xlsx, .xls"
                                    style={{ display: "none" }}
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            <Button className="action-button" onClick={handleExportData}>
                                <FaFileExport /> Exporter
                            </Button>
                            <Button className="action-button" onClick={handleDownloadExample}>
                                <FaFileExcel /> Modèle
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="products-tabs">
                <Nav
                    variant="tabs"
                    activeKey={state.activeTab}
                    onSelect={(eventKey) => dispatch({ type: 'SET_ACTIVE_TAB', payload: eventKey })}
                    className="justify-content-between"
                >
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
                </Nav>

                <div className="tab-content mt-3">
                    {state.activeTab === 'Active' && <DisplayProductData data={state.uploadedData} />}
                    {state.activeTab === 'Inactive' && <div>Inactive Content</div>}
                    {state.activeTab === 'Draft' && <div>Draft Content</div>}
                    {state.activeTab === 'Unknown' && <div>Unknown Content</div>}
                </div>
            </div>

            <ProductForm
                show={state.showOffcanvas}
                onHide={() => dispatch({ type: 'TOGGLE_OFFCANVAS', payload: false })}
                placement="end"
            />

            <Modal show={state.showModal} onHide={handleCancelImport} className="confirmation-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Validation des Données</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {state.validationSummary.length > 0 ? (
                        <div className="error-container">
                            <h5>Problèmes détectés :</h5>
                            <ul>
                                {state.validationSummary.map((error, index) => (
                                    <li key={index} className="error-item">{error}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="success-message">Les données sont valides et prêtes pour l'importation.</p>
                    )}
                    <Table responsive="sm">
                        <thead>
                        <tr>
                            {expectedFields.map((field, index) => (
                                <th key={index}>{field}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {state.parsedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {expectedFields.map((field, colIndex) => (
                                    <td key={colIndex}>{row[field] || "-"}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="cancel-data-excel" onClick={handleCancelImport}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmImport}
                        disabled={state.validationSummary.length > 0}
                        className="confirm-data-excel"
                    >
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}