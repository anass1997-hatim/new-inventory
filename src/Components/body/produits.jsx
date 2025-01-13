import '../../CSS/shared.css';
import Container from "react-bootstrap/Container";
import { Col, InputGroup, Nav, Row, Form, Button, Dropdown } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import { useReducer, useRef, useState } from "react";
import DisplayProductData from '../data/data_produits';
import * as XLSX from "xlsx";
import ValidationModal from "../modals/produits_modal";
import DataComponent from "../form/data_form";

const necessaryFields = [
    "Identifiant",
    "Code-barres",
    "Titre",
    "Catégorie",
    "Quantité",
    "Quantité Disponible",
    "Prix",
    "Date d'expiration",
];

const optionalFields = [
    "Marque",
    "Modèle",
    "Sous-catégories",
    "Famille",
    "Sous-famille",
    "Taille",
    "Couleur",
    "Poids",
    "Dimensions",
    "Date de Création",
];

const initialState = {
    activeTab: 'Active',
    showOffcanvas: false,
    uploadedData: [],
    parsedData: [],
    validationSummary: [],
    showModal: false,
    isProcessingFile: false,
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
        case 'SET_PROCESSING_FILE':
            return { ...state, isProcessingFile: action.payload };
        case 'RESET_IMPORT_DATA':
            return {
                ...state,
                parsedData: [],
                validationSummary: [],
                showModal: false,
                isProcessingFile: false,
            };
        default:
            return state;
    }
};

export default function Produits() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const fileInputRef = useRef(null);
    const [filterText, setFilterText] = useState(""); // State for filtering
    const [hiddenColumns, setHiddenColumns] = useState([]); // State to manage hidden columns

    const toggleColumn = (columnName) => {
        setHiddenColumns((prev) =>
            prev.includes(columnName)
                ? prev.filter((col) => col !== columnName)
                : [...prev, columnName]
        );
    };

    const validateExcelData = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return false;
        }

        const errors = [];
        const headers = Object.keys(data[0]);

        const missingFields = necessaryFields.filter((field) => !headers.includes(field));
        if (missingFields.length > 0) {
            errors.push(`Les champs obligatoires suivants sont manquants : ${missingFields.join(", ")}`);
        }

        let missingFieldCounts = {};
        const today = new Date().toISOString().split('T')[0];

        data.forEach((row, index) => {
            if (!row["Date de Création"] || row["Date de Création"].toString().trim() === "") {
                row["Date de Création"] = today;
            }

            necessaryFields.forEach((field) => {
                if (!row[field] || row[field].toString().trim() === "") {
                    missingFieldCounts[field] = missingFieldCounts[field] || [];
                    missingFieldCounts[field].push(index + 1);
                }
            });
        });

        if (Object.keys(missingFieldCounts).length > 0) {
            Object.entries(missingFieldCounts).forEach(([field, rows]) => {
                errors.push(`${field} manquant dans ${rows.length} ligne(s): ${rows.join(", ")}`);
            });
        }

        dispatch({ type: 'SET_VALIDATION_SUMMARY', payload: errors });
        return errors.length === 0;
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || state.isProcessingFile) return;

        try {
            dispatch({ type: 'SET_PROCESSING_FILE', payload: true });

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });

            if (!workbook.SheetNames.length) {
                throw new Error("Le fichier Excel est vide");
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
                dateNF: 'yyyy-mm-dd'
            });

            if (!jsonData.length) {
                throw new Error("Aucune donnée trouvée dans le fichier");
            }

            dispatch({ type: 'SET_PARSED_DATA', payload: jsonData });
            validateExcelData(jsonData);
            dispatch({ type: 'TOGGLE_MODAL', payload: true });
        } catch (error) {
            console.error("Erreur lors du traitement du fichier:", error);
            alert(`Erreur lors du traitement du fichier: ${error.message}`);
        } finally {
            dispatch({ type: 'SET_PROCESSING_FILE', payload: false });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleConfirmImport = () => {
        const newData = [...state.uploadedData, ...state.parsedData];
        dispatch({ type: 'SET_UPLOADED_DATA', payload: newData });
        dispatch({ type: 'RESET_IMPORT_DATA' });
    };

    const handleCancelImport = () => {
        dispatch({ type: 'RESET_IMPORT_DATA' });
    };

    const handleExportData = () => {
        if (state.uploadedData.length === 0) {
            alert("Aucune donnée à exporter");
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(state.uploadedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
            XLSX.writeFile(workbook, `produits_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            alert("Erreur lors de l'exportation du fichier");
        }
    };

    const handleDownloadExample = () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const exampleData = [
                {
                    Identifiant: "12345",
                    "Code-barres": "123456789",
                    Titre: "Exemple Titre",
                    Catégorie: "Exemple Catégorie",
                    Quantité: "10",
                    "Quantité Disponible": "8",
                    Prix: "100",
                    "Date de Création": today,
                    "Date d'expiration": "2024-12-31",
                    Marque: "Exemple Marque",
                    Modèle: "Exemple Modèle",
                    "Sous-catégories": "Exemple Sous-catégorie",
                    Famille: "Exemple Famille",
                    "Sous-famille": "Exemple Sous-famille",
                    Taille: "M",
                    Couleur: "Bleu",
                    Poids: "1kg",
                    Dimensions: "30x20x10",
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(exampleData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Exemple");
            XLSX.writeFile(workbook, "modele_produits.xlsx");
        } catch (error) {
            console.error("Erreur lors du téléchargement du modèle:", error);
            alert("Erreur lors du téléchargement du modèle");
        }
    };


    const filteredData = state.uploadedData.filter((item) => {
        const searchText = filterText.toLowerCase();
        return (
            item.Titre?.toLowerCase().includes(searchText) ||
            item["Code-barres"]?.toLowerCase().includes(searchText) ||
            item.Catégorie?.toLowerCase().includes(searchText)
        );
    });

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
                                <Button variant="primary"><FaSearch /></Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={() => dispatch({ type: 'TOGGLE_OFFCANVAS', payload: true })}
                                disabled={state.isProcessingFile}
                            >
                                <FaPlus /> Ajouter
                            </Button>
                            <Button
                                className="action-button"
                                disabled={state.isProcessingFile}
                            >
                                <label htmlFor="file-upload" style={{ margin: 0, cursor: 'pointer' }}>
                                    <FaFileImport /> Importer
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="file-upload"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    style={{ display: "none" }}
                                />
                            </Button>
                            <Button
                                onClick={handleExportData}
                                className="action-button"
                                disabled={state.isProcessingFile || state.uploadedData.length === 0}
                            >
                                <FaFileExport /> Exporter
                            </Button>
                            <Button
                                onClick={handleDownloadExample}
                                className="action-button"
                                disabled={state.isProcessingFile}
                            >
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
                >
                    <Nav.Item><Nav.Link eventKey="Active">Active</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="Inactive">Inactive</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="Déstockage">Déstockage</Nav.Link></Nav.Item>
                    <Dropdown as={Nav.Item}>
                        <Dropdown.Toggle as={Nav.Link}>Filtrer</Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-filter">
                            {necessaryFields.map((field) => (
                                <Dropdown.Item key={field} onClick={() => toggleColumn(field)}>
                                    {hiddenColumns.includes(field) ? `Afficher ${field}` : `Masquer ${field}`}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
                <div className="tab-content mt-3">
                    {state.activeTab === 'Active' && <DisplayProductData data={filteredData} hiddenColumns={hiddenColumns} />}
                    {state.activeTab === 'Inactive' && <div>Inactive Content</div>}
                    {state.activeTab === 'Déstockage' && <div>Déstockage Content</div>}
                </div>
            </div>

            <DataComponent
                show={state.showOffcanvas}
                onHide={() => dispatch({ type: 'TOGGLE_OFFCANVAS', payload: false })}
            />

            <ValidationModal
                show={state.showModal}
                onHide={handleCancelImport}
                validationSummary={state.validationSummary}
                necessaryFields={necessaryFields}
                optionalFields={optionalFields}
                parsedData={state.parsedData}
                onConfirm={handleConfirmImport}
            />
        </>
    );
}
