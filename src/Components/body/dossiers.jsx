import '../../CSS/shared.css';
import Container from "react-bootstrap/Container";
import { Col, InputGroup, Nav, Row, Form, Button } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import { useReducer, useRef } from "react";
import DisplayDossiersData from '../data/data_dossiers';
import * as XLSX from "xlsx";
import ValidationModal from "../modals/dossiers_modal";
import FolderForm from "../form/ajout_dossier";

const necessaryFields = [
    "Identifiant",
    "Code-barres",
    "Nom du dossie",
    "Catégorie",
    "Emplacement",
    "Description",
    "Permission",
    "Créé le"
];

const optionalFields = [
    "Numéro de commande",
    "Nom de la dernière intervention",
    "Ville",
    "Bâtiment",
    "Étage",
    "Salle"
];

const initialState = {
    activeTab: 'Active',
    showFolderForm: false,
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
        case 'TOGGLE_FOLDER_FORM':
            return { ...state, showFolderForm: action.payload };
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

export default function Dossiers() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const fileInputRef = useRef(null);

    const validateExcelData = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return false;
        }

        const errors = [];
        const headers = Object.keys(data[0]);

        // Check for missing required fields
        const missingFields = necessaryFields.filter((field) => !headers.includes(field));
        if (missingFields.length > 0) {
            errors.push(`Les champs obligatoires suivants sont manquants : ${missingFields.join(", ")}`);
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
        const normalizedData = state.parsedData.map((row) => ({
            Identifiant: row["Identifiant"] || "-",
            "Code-barres": row["Code-barres"] || "-",
            "Nom du dossie": row["Nom du dossie"] || "-",
            Catégorie: row["Catégorie"] || "-",
            Emplacement: row["Emplacement"] || "-",
            Description: row["Description"] || "-",
            Permission: row["Permission"] || "-",
            "Créé le": row["Créé le"] || "-",
            "Numéro de commande": row["Numéro de commande"] || "-",
            "Nom de la dernière intervention": row["Nom de la dernière intervention"] || "-",
            "Ville": row["Ville"] || "-",
            "Bâtiment": row["Bâtiment"] || "-",
            "Étage": row["Étage"] || "-",
            "Salle": row["Salle"] || "-"
        }));

        const newData = [...state.uploadedData, ...normalizedData];
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
            XLSX.utils.book_append_sheet(workbook, worksheet, "Dossiers");
            XLSX.writeFile(workbook, `dossiers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            alert("Erreur lors de l'exportation du fichier");
        }
    };

    const handleDownloadExample = () => {
        const exampleData = [
            {
                Identifiant: "DOS001",
                "Code-barres": "123456789",
                "Nom du dossie": "Exemple Dossier",
                Catégorie: "Catégorie exemple",
                Emplacement: "Emplacement exemple",
                Description: "Description exemple",
                Permission: "Lecture, Modification",
                "Créé le": new Date().toISOString().split("T")[0],
                "Numéro de commande": "CMD001",
                "Nom de la dernière intervention": "Maintenance préventive",
                "Ville": "Paris",
                "Bâtiment": "Bâtiment A",
                "Étage": "2ème étage",
                "Salle": "Salle 204"
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(exampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exemple");
        XLSX.writeFile(workbook, "modele_dossiers.xlsx");
    };

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col>
                            <InputGroup className="search-input-group">
                                <Form.Control placeholder="Rechercher dossiers" />
                                <Button variant="primary"><FaSearch /></Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={() => dispatch({ type: 'TOGGLE_FOLDER_FORM', payload: true })}
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
                </Nav>
                <div className="tab-content mt-3">
                    {state.activeTab === 'Active' && <DisplayDossiersData data={state.uploadedData} />}
                    {state.activeTab === 'Inactive' && <div>Inactive Content</div>}
                    {state.activeTab === 'Déstockage' && <div>Déstockage Content</div>}
                </div>
            </div>

            <FolderForm
                show={state.showFolderForm}
                onHide={() => dispatch({ type: 'TOGGLE_FOLDER_FORM', payload: false })}
                isFromProductForm={false}
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