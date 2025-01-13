import '../../CSS/shared.css';
import Container from "react-bootstrap/Container";
import { Col, InputGroup, Row, Form, Button, Nav } from "react-bootstrap";
import { FaSearch, FaPlus, FaFileImport, FaFileExport, FaFileExcel } from "react-icons/fa";
import { useReducer, useRef, useState } from "react";
import * as XLSX from "xlsx";
import DisplayEmplacementsData from '../data/data_emplacements';
import EmplacementForm from "../form/ajout_emplacement";
import ValidationModal from "../modals/emplacement_modal";

const necessaryFields = [
    "id",
    "emplacement",
];

const optionalFields = [];

const initialState = {
    activeTab: 'Active',
    showForm: false,
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
        case 'TOGGLE_FORM':
            return { ...state, showForm: action.payload };
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
        case 'ADD_EMPLACEMENT':
            return {
                ...state,
                uploadedData: [...state.uploadedData, action.payload],
            };
        default:
            return state;
    }
};

export default function Emplacements() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const fileInputRef = useRef(null);
    const [filterText, setFilterText] = useState(""); // State for filtering

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
            id: row["id"] || "-",
            emplacement: row["emplacement"] || "-",
        }));

        const newData = [...state.uploadedData, ...normalizedData];
        dispatch({ type: 'SET_UPLOADED_DATA', payload: newData });
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
            XLSX.utils.book_append_sheet(workbook, worksheet, "Emplacements");
            XLSX.writeFile(workbook, `emplacements_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            alert("Erreur lors de l'exportation du fichier");
        }
    };

    const handleDownloadExample = () => {
        const exampleData = [
            {
                id: "EMPL001",
                emplacement: "Zone A - Section 2",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(exampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exemple");
        XLSX.writeFile(workbook, "modele_emplacements.xlsx");
    };

    const addNewEmplacement = (emplacementData) => {
        dispatch({ type: 'ADD_EMPLACEMENT', payload: emplacementData });
        dispatch({ type: 'TOGGLE_FORM', payload: false });
    };

    const filteredData = state.uploadedData.filter((item) => {
        const searchText = filterText.toLowerCase();
        return (
            item.id?.toLowerCase().includes(searchText) ||
            item.emplacement?.toLowerCase().includes(searchText)
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
                                    placeholder="Rechercher emplacements"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                                <Button variant="primary"><FaSearch /></Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={() => dispatch({ type: 'TOGGLE_FORM', payload: true })}
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
                </Nav>
                <div className="tab-content mt-3">
                    <DisplayEmplacementsData data={filteredData} />
                </div>
            </div>

            <EmplacementForm
                show={state.showForm}
                onHide={() => dispatch({ type: 'TOGGLE_FORM', payload: false })}
                onSave={addNewEmplacement}
            />

            <ValidationModal
                show={state.showModal}
                onHide={() => dispatch({ type: 'TOGGLE_MODAL', payload: false })}
                validationSummary={state.validationSummary}
                necessaryFields={necessaryFields}
                optionalFields={optionalFields}
                parsedData={state.parsedData}
                onConfirm={handleConfirmImport}
            />
        </>
    );
}
