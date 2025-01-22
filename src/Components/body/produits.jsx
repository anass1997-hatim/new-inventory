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
    "Référence",
    "Type",
    "Code Barres",
    "Unité Type",
    "Prix Vente TTC",
    "Description",
    "Catégorie"
];

const optionalFields = [
    "Sous Catégorie",
    "Marque",
    "Model",
    "Famille",
    "Sous Famille",
    "Taille",
    "Couleur",
    "Poids",
    "Volume",
    "Dimensions"
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
    const [filterText, setFilterText] = useState("");
    const [hiddenColumns, setHiddenColumns] = useState([]);

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

        const allowedTypes = ["Revente", "Immobilisation", "Equipement"];
        const allowedUnitTypes = ["Pièce", "Douzaine"];
        const maxDisplayedErrors = 5;
        const errors = [];
        const typeErrors = new Set();
        const uniteTypeErrors = new Set();
        const headers = Object.keys(data[0]);

        const missingFields = necessaryFields.filter((field) => !headers.includes(field));
        if (missingFields.length > 0) {
            errors.push(`Les champs obligatoires suivants sont manquants : ${missingFields.join(", ")}`);
        }

        let missingFieldCounts = {};

        data.forEach((row, index) => {
            necessaryFields.forEach((field) => {
                if (!row[field] || row[field].toString().trim() === "") {
                    missingFieldCounts[field] = missingFieldCounts[field] || [];
                    missingFieldCounts[field].push(index + 1);
                }
            });

            if (row["Type"] && !allowedTypes.includes(row["Type"])) {
                typeErrors.add(row["Type"]);
            }

            if (row["Unité Type"] && !allowedUnitTypes.includes(row["Unité Type"])) {
                uniteTypeErrors.add(row["Unité Type"]);
            }

            if (Object.keys(row).some(key => optionalFields.includes(key))) {
                row.champs_personnalises = {
                    sousCategorie: row["Sous Catégorie"] || null,
                    marque: row["Marque"] || null,
                    model: row["Model"] || null,
                    famille: row["Famille"] || null,
                    sousFamille: row["Sous Famille"] || null,
                    taille: row["Taille"] || null,
                    couleur: row["Couleur"] || null,
                    poids: row["Poids"] || null,
                    volume: row["Volume"] || null,
                    dimensions: row["Dimensions"] || null
                };
            }
        });

        if (typeErrors.size > 0) {
            errors.push(
                `Type invalide: ${Array.from(typeErrors).join(", ")}. Les valeurs autorisées sont: ${allowedTypes.join(", ")}.`
            );
        }

        if (uniteTypeErrors.size > 0) {
            errors.push(
                `Unité Type invalide: ${Array.from(uniteTypeErrors).join(", ")}. Les valeurs autorisées sont: ${allowedUnitTypes.join(", ")}.`
            );
        }

        if (Object.keys(missingFieldCounts).length > 0) {
            Object.entries(missingFieldCounts).forEach(([field, rows]) => {
                errors.push(`${field} manquant dans ${rows.length} ligne(s): ${rows.slice(0, maxDisplayedErrors).join(", ")}${rows.length > maxDisplayedErrors ? `, et ${rows.length - maxDisplayedErrors} autres` : ""}`);
            });
        }

        const displayedErrors = errors.slice(0, maxDisplayedErrors);
        if (errors.length > maxDisplayedErrors) {
            displayedErrors.push(`Et ${errors.length - maxDisplayedErrors} erreurs supplémentaires non affichées.`);
        }

        dispatch({ type: 'SET_VALIDATION_SUMMARY', payload: displayedErrors });
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
            const exampleData = [
                {
                    "Référence": "PROD124",
                    "Type": "Revente",
                    "Code Barres": "1234567890124",
                    "Unité Type": "Pièce",
                    "Prix Vente TTC": 29.99,
                    "Description": "Produit de test avec sous-catégorie",
                    "Catégorie": "Electronics",
                    "Sous Catégorie": "Smartphones",
                    "Marque": "Samsung",
                    "Model": "Galaxy S21",
                    "Famille": "Living Room Furniture",
                    "Sous Famille": "Dresses",
                    "Taille": "L",
                    "Couleur": "Bleu",
                    "Poids": "0.7",
                    "Volume": "1.5",
                    "Dimensions": "15x25x35"
                }
            ];

            const allowedTypes = ["Revente", "Immobilisation", "Equipement"];
            const allowedUnitTypes = ["Pièce", "Douzaine"];

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exampleData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Exemple");

            worksheet["!datavalidation"] = {
                B2: {
                    type: "list",
                    operator: "equal",
                    sqref: "B2:B1000",
                    formulas: [allowedTypes]
                },
                D2: {
                    type: "list",
                    operator: "equal",
                    sqref: "D2:D1000",
                    formulas: [allowedUnitTypes]
                }
            };

            XLSX.writeFile(workbook, "modele_produits.xlsx");
        } catch (error) {
            console.error("Erreur lors du téléchargement du modèle:", error);
            alert("Erreur lors du téléchargement du modèle");
        }
    };

    const filteredData = state.uploadedData.filter((item) => {
        const searchText = filterText.toLowerCase();
        return (
            item.Description?.toLowerCase().includes(searchText) ||
            item["Code Barres"]?.toLowerCase().includes(searchText) ||
            item.Référence?.toLowerCase().includes(searchText)
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
                                <Button><FaSearch /></Button>
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
                            <Button className="action-button" disabled={state.isProcessingFile}>
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