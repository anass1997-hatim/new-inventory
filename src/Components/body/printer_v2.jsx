import "../../CSS/printerV2.css";
import { InputGroup, Form, Button, Modal, Table, Dropdown } from "react-bootstrap"; // Use Dropdown from react-bootstrap
import { FaSearch } from "react-icons/fa";
import DisplayPrintsData from "../data/prints_data";
import { useReducer } from "react";
import * as XLSX from "xlsx";

const expectedFields = ["Title", "SKU", "Print Tags", "IPC*", "Items"];

const initialState = {
    parsedData: [],
    validationSummary: [],
    showModal: false,
    confirmedData: [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_PARSED_DATA":
            return { ...state, parsedData: action.payload };
        case "SET_VALIDATION_SUMMARY":
            return { ...state, validationSummary: action.payload };
        case "TOGGLE_MODAL":
            return { ...state, showModal: action.payload };
        case "SET_CONFIRMED_DATA":
            return { ...state, confirmedData: action.payload };
        case "RESET_IMPORT_DATA":
            return { ...state, parsedData: [], validationSummary: [], showModal: false };
        default:
            return state;
    }
};

export default function UsePrinterV2() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateExcelData = (data) => {
        const errors = [];
        const headers = Object.keys(data[0] || {});

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

        dispatch({ type: "SET_VALIDATION_SUMMARY", payload: errors });
        return errors.length === 0;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target.result instanceof ArrayBuffer) {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    dispatch({ type: "SET_PARSED_DATA", payload: jsonData });
                    if (validateExcelData(jsonData)) {
                        dispatch({ type: "TOGGLE_MODAL", payload: true });
                    }
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
        dispatch({ type: "SET_CONFIRMED_DATA", payload: state.parsedData });
        dispatch({ type: "TOGGLE_MODAL", payload: false });
    };

    const handleCancelImport = () => {
        dispatch({ type: "RESET_IMPORT_DATA" });
    };

    const handleDownloadExample = () => {
        const exampleData = [
            { Title: "Example Title", SKU: "12345", "Print Tags": "Tag1, Tag2", "IPC*": "ABC123", Items: 10 },
        ];
        const worksheet = XLSX.utils.json_to_sheet(exampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Example");
        XLSX.writeFile(workbook, "example_prints.xlsx");
    };

    return (
        <div className="printer-v2">
            <div className="printer-v2-produits">
                <label className="printer-v2-produits-text">
                    Produits
                    <div className="printer-v2-produits-input-sections">
                        <InputGroup className="printer-v2-search-input">
                            <Form.Control
                                placeholder="saisissez pour rechercher des produits"
                                aria-label="Search for a product"
                            />
                            <InputGroup.Text className="icon-prod-v2">
                                <FaSearch />
                            </InputGroup.Text>
                        </InputGroup>
                        <div className="printer-v2-search-input-dropdowns">
                            <InputGroup className="printer-v2-search-input-ref">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter reference"
                                    className="form-control"
                                    aria-label="Reference"
                                />
                                <InputGroup.Text className="icon-prod-v2">Ref</InputGroup.Text>
                            </InputGroup>
                        </div>
                        <div className="printer-v2-search-input-dropdowns">
                            <InputGroup className="printer-v2-search-input">
                                <Dropdown>
                                    <Dropdown.Toggle className="printer-v2-dropdown">Dropdown Button</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <InputGroup.Text className="icon-prod-v2">Printer</InputGroup.Text>
                            </InputGroup>
                        </div>
                        <div className="printer-v2-search-input-dropdowns">
                            <InputGroup className="printer-v2-search-input">
                                <Dropdown>
                                    <Dropdown.Toggle className="printer-v2-dropdown">Dropdown Button</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <InputGroup.Text className="icon-prod-v2">Label</InputGroup.Text>
                            </InputGroup>
                        </div>
                    </div>
                </label>
            </div>
            <div className="printer-v2-data">
                <div className="checkbox-group">
                    <label className="checkbox-item">
                        <input type="checkbox" name="epc-lock" />
                        EPC Lock
                    </label>
                    <label className="checkbox-item">
                        <input type="checkbox" name="epc-verification" />
                        EPC Verification
                    </label>
                </div>
                <div className="action-buttons">
                    <label htmlFor="file-upload" className="action-button" style={{ cursor: "pointer" }}>
                        Importer depuis Excel
                        <input
                            type="file"
                            id="file-upload"
                            accept=".xlsx, .xls"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </label>
                    <button className="action-button" onClick={handleDownloadExample}>
                        Télécharger un modèle
                    </button>
                </div>
            </div>
            <DisplayPrintsData data={state.confirmedData} />
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
                                    <li key={index} className="error-item">
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="success-message">Les données sont valides et prêtes pour l'importation.</p>
                    )}
                    <Table striped>
                        <thead>
                        <tr>
                            {expectedFields.map((field) => (
                                <th key={field}>{field}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {state.parsedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {expectedFields.map((field) => (
                                    <td key={field}>{row[field] || "-"}</td>
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
                    <Button className="confirm-data-excel" onClick={handleConfirmImport} disabled={state.validationSummary.length > 0}>
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
