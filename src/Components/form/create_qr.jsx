import "../../CSS/label-print.css";
import {useRef, useEffect, useCallback, useMemo, useReducer, useState} from "react";
import Container from "react-bootstrap/Container";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { Rnd } from "react-rnd";
import JsBarcode from "jsbarcode";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";


const generateSKU = (itemType, department = '') => {
    const prefix = {
        'product': 'P',
        'category': 'C',
        'inventory': 'I'
    }[itemType] || 'X';

    const deptCode = department ? department.substring(0, 2).toUpperCase() : 'XX';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const timestamp = Date.now().toString().slice(-4);

    return `${prefix}${deptCode}${random}${timestamp}`;
};




const TICKET_SIZES = [
    { label: "Petit (5x2.5cm)", width: 5, height: 2.5 },
    { label: "Moyen (7x4cm)", width: 7, height: 4 },
    { label: "Grand (10x5cm)", width: 10, height: 5 },
    { label: "Très grand (15x7cm)", width: 15, height: 7 },
];
const BARCODE_TYPES = [
    {
        type: 'CODE128',
        label: 'Code 128',
        description: 'High-density alphanumeric, used in shipping and packaging',
        placeholder: 'ABC123'
    },
    {
        type: 'EAN13',
        label: 'EAN-13',
        description: 'International retail products, 13 digits',
        placeholder: '5901234123457'
    },
    {
        type: 'EAN8',
        label: 'EAN-8',
        description: 'Small products, 8 digits',
        placeholder: '12345670'
    },
    {
        type: 'UPC',
        label: 'UPC',
        description: 'Retail products in North America, 12 digits',
        placeholder: '042100005264'
    },
    {
        type: 'CODE39',
        label: 'Code 39',
        description: 'Industry and logistics, alphanumeric',
        placeholder: 'CODE39'
    },
    {
        type: 'ITF',
        label: 'ITF-14',
        description: 'Outer packaging and shipping boxes, numeric',
        placeholder: '12345678901231'
    },
    {
        type: 'MSI',
        label: 'MSI',
        description: 'Inventory control and warehouse applications',
        placeholder: '123456'
    },
    {
        type: 'Codabar',
        label: 'Codabar',
        description: 'Libraries, blood banks, and shipping',
        placeholder: 'A123456A'
    },
    {
        type: 'DataMatrix',
        label: 'Data Matrix',
        description: 'Small items, medical instruments, and electronics',
        placeholder: 'DM123'
    },
    {
        type: 'PDF417',
        label: 'PDF417',
        description: 'IDs, shipping labels, and inventory',
        placeholder: 'PDF1234567'
    },
    {
        type: 'Aztec',
        label: 'Aztec',
        description: 'Transportation tickets and industrial applications',
        placeholder: 'Aztec123'
    },
    {
        type: 'EAN5',
        label: 'EAN-5',
        description: 'Supplementary barcode for periodicals and books',
        placeholder: '12345'
    },
    {
        type: 'EAN2',
        label: 'EAN-2',
        description: 'Supplementary barcode for magazines',
        placeholder: '12'
    },
    {
        type: 'Plessey',
        label: 'Plessey',
        description: 'Library systems and warehousing',
        placeholder: '123456789'
    },
    {
        type: 'Interleaved 2 of 5',
        label: 'Interleaved 2 of 5',
        description: 'Cartons and warehouse labels, numeric',
        placeholder: '12345678'
    }
];


const DYNAMIC_ATTRIBUTES = [
    // Product Attributes
    { label: "SKU", value: "{sku}", category: "product" },
    { label: "Référence produit", value: "{ref_produit}", category: "product" },
    { label: "Nom produit", value: "{nom_produit}", category: "product" },
    { label: "Prix", value: "{prix}", category: "product" },
    { label: "Stock disponible", value: "{stock}", category: "product" },
    { label: "Emplacement", value: "{emplacement}", category: "product" },
    { label: "Date d'expiration", value: "{date_exp}", category: "product" },
    { label: "Poids produit", value: "{poids}", category: "product" }, // New
    { label: "Dimensions produit", value: "{dimensions}", category: "product" }, // New
    { label: "Marque", value: "{brand}", category: "product" }, // New

    // Category Attributes
    { label: "Code catégorie", value: "{code_cat}", category: "category" },
    { label: "Nom catégorie", value: "{nom_cat}", category: "category" },
    { label: "Nombre produits", value: "{nb_produits}", category: "category" },
    { label: "Responsable", value: "{responsable}", category: "category" },
    { label: "Description catégorie", value: "{desc_cat}", category: "category" },
    { label: "Popularité", value: "{popularity}", category: "category" }, // New
    { label: "Sous-catégories", value: "{sub_categories}", category: "category" }, // New
    { label: "Date création", value: "{creation_date}", category: "category" }, // New
    { label: "Dernière mise à jour", value: "{last_update}", category: "category" }, // New
    { label: "Statut catégorie", value: "{category_status}", category: "category" }, // New

    // Inventory Attributes
    { label: "Code inventaire", value: "{code_inv}", category: "inventory" },
    { label: "Zone stockage", value: "{zone}", category: "inventory" },
    { label: "Quantité totale", value: "{quantite}", category: "inventory" },
    { label: "Date inventaire", value: "{date_inv}", category: "inventory" },
    { label: "Statut inventaire", value: "{statut_inv}", category: "inventory" },
    { label: "Nom entrepôt", value: "{warehouse_name}", category: "inventory" },
    { label: "Adresse entrepôt", value: "{warehouse_address}", category: "inventory" },
    { label: "Date réception", value: "{reception_date}", category: "inventory" },
    { label: "Numéro lot", value: "{lot_number}", category: "inventory" },
    { label: "Type de stockage", value: "{storage_type}", category: "inventory" }
];


const initialState = {
    elements: [],
    selectedElement: 0,
    selectedTicketSize: TICKET_SIZES[0],
    itemType: "product",
    history: [],
    currentIndex: -1,
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_ELEMENTS":
            return {
                ...state,
                elements: action.payload,
                history: [...state.history.slice(0, state.currentIndex + 1), action.payload],
                currentIndex: state.currentIndex + 1,
            };
        case "UNDO":
            return {
                ...state,
                elements: state.history[state.currentIndex - 1],
                currentIndex: state.currentIndex - 1,
            };
        case "REDO":
            return {
                ...state,
                elements: state.history[state.currentIndex + 1],
                currentIndex: state.currentIndex + 1,
            };
        case "SET_SELECTED":
            return { ...state, selectedElement: action.payload };
        case "SET_SIZE":
            return { ...state, selectedTicketSize: action.payload };
        case "SET_TYPE":
            return { ...state, itemType: action.payload };
        case "SET_VALIDATION_RESULT":
            return { ...state, validationResult: action.payload };
        default:
            return state;
    }
}
const Barcode = ({ value, width = 1, height = 2.5, format, attributes = [], x = 0, y = 0 }) => {
    const barcodeRef = useRef();

    const displayValue = useMemo(() => {
        if (attributes && attributes.length > 0) {
            const attributeValues = attributes.map(attr => attr.randomValue || attr.value.replace(/[{}]/g, ""));
            const attributeLabels = attributes.map(attr => attr.label);
            return {
                values: [value, ...attributeValues].join(" "), // Combine values into one line
                labels: ["", ...attributeLabels].join(" ") // Combine labels into one line
            };
        }
        return { values: value, labels: "" }; // Default to only value if no attributes
    }, [value, attributes]);

    const calculatedBarWidth = useMemo(() => {
        const baseWidth = 2;
        const reductionPerAttribute = 0.5;
        const reduction = attributes.length * reductionPerAttribute;
        const minWidth = 0.5;
        return Math.max(baseWidth - reduction, minWidth);
    }, [attributes.length]);

    const calculatedWidth = useMemo(() => {
        const minWidth = 0.5;
        const maxWidth = 8;
        return Math.min(Math.max(width, minWidth), maxWidth);
    }, [width]);

    useEffect(() => {
        if (barcodeRef.current && value) {
            try {
                JsBarcode(barcodeRef.current, value, {
                    format: format,
                    width: calculatedBarWidth,
                    height: height * 25,
                    displayValue: false,
                    margin: 0,
                });
            } catch (error) {
                console.error("Invalid barcode value:", error);
            }
        }
    }, [value, calculatedBarWidth, height, format]);

    return (
        <div style={{ position: "absolute", left: `${x}px`, top: `${y}px`, display: "flex", flexDirection: "column", alignItems: "center", padding: "2px" }}>
            <svg ref={barcodeRef} style={{ margin: "0 auto" }} />
            <div style={{ textAlign: "center", marginTop: "5px", fontSize: "10px", wordBreak: "break-word", whiteSpace: "pre-line", maxWidth: `${calculatedWidth * 37.8}px` }}>
                <div>{displayValue.values}</div>
                <div style={{ fontSize: "8px", marginTop: "2px", color: "gray" }}>{displayValue.labels}</div>
            </div>
        </div>
    );
};


export default function CreateQr({ printer }) {
    const [selectedBarcodeType, setSelectedBarcodeType] = useState("CODE128");
    const [showBarcodeTypeSelector, setShowBarcodeTypeSelector] = useState(false);
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        elements: printer ? [{
            type: printer.type === "QR" ? "qr" : printer.type === "EMPTY" ? "text" : "barcode",
            content: printer.type === "EMPTY" ? printer.value : "",
            value: printer.value,
            format: printer.format || "CODE128",
            x: 50,
            y: 50,
            fontSize: 24,
            width: 4,
            height: 2,
            attributes: []
        }] : []
    });
    const navigate = useNavigate();
    const previewRef = useRef();
    const canUndo = state.currentIndex > 0;
    const canRedo = state.currentIndex < state.history.length - 1;
    const handleBack = useCallback(() => {
        navigate('/Printer');
    }, [navigate]);

    const handleAttributeToggle = useCallback((attr) => {
        const updatedElements = state.elements.map((element) => {
            const attrIndex = element.attributes?.findIndex((a) => a.value === attr.value);

            if (attrIndex === -1 && (!element.attributes || element.attributes.length < 3)) {
                const newAttributes = [...(element.attributes || []), attr];
                let newValue = element.value || '';
                if (element === state.elements[state.selectedElement]) {
                    newValue = `${element.value || ''} ${attr.value}`;
                }
                return { ...element, attributes: newAttributes, value: newValue };
            }

            if (attrIndex !== -1) {
                const newAttributes = element.attributes.filter((a) => a.value !== attr.value);
                let newValue = element.value || '';
                if (element === state.elements[state.selectedElement]) {
                    newValue = newValue.replace(` ${attr.value}`, '');
                }
                return { ...element, attributes: newAttributes, value: newValue };
            }

            return element;
        });
        dispatch({ type: "SET_ELEMENTS", payload: updatedElements });
    }, [state.elements, state.selectedElement]);

    const generateSpecializedContent = useCallback((itemType, currentName) => {
        const departments = ["Électronique", "Vêtements", "Alimentation", "Mobilier", "Sport"];
        const locations = ["A", "B", "C", "D", "E"];
        const conditions = ["Neuf", "Occasion", "Réparé", "Premium"];

        const department = departments[Math.floor(Math.random() * departments.length)];
        const sku = generateSKU(itemType, department);

        const baseContent = {
            product: () => {
                const price = (Math.random() * 1000).toFixed(2);
                const condition = conditions[Math.floor(Math.random() * conditions.length)];
                return {
                    text: `SKU: ${sku}\n${currentName || "Nouveau Produit"}\nDépartement: ${department}\nÉtat: ${condition}\nPrix: ${price}DH`,
                    barcode: sku,
                    qr: JSON.stringify({
                        type: "PRODUCT",
                        sku: sku,
                        name: currentName || "Nouveau Produit",
                        department,
                        condition,
                        price,
                    }),
                };
            },
            category: () => {
                return {
                    text: `SKU: ${sku}\n${currentName || "Nouvelle Catégorie"}\nDépartement: ${department}`,
                    barcode: sku,
                    qr: JSON.stringify({
                        type: "CATEGORY",
                        sku: sku,
                        name: currentName || "Nouvelle Catégorie",
                        department,
                    }),
                };
            },
            inventory: () => {
                const location = locations[Math.floor(Math.random() * locations.length)];
                const quantity = Math.floor(Math.random() * 1000);
                return {
                    text: `SKU: ${sku}\n${currentName || "Stock"}\nZone: ${location}\nQuantité: ${quantity}`,
                    barcode: sku,
                    qr: JSON.stringify({
                        type: "INVENTORY",
                        sku: sku,
                        location,
                        quantity,
                    }),
                };
            },
        };

        return baseContent[itemType]();
    }, []);


    const handleSmartGenerate = useCallback(() => {
        const updatedElements = [...state.elements];
        const selectedIndex = state.selectedElement;

        if (updatedElements[selectedIndex]) {
            const currentElement = updatedElements[selectedIndex];
            const currentName = currentElement.content || currentElement.value || "";
            const content = generateSpecializedContent(state.itemType, currentName);
            const updatedElement = { ...currentElement };
            const typeReference =
                state.itemType === "product" ? "P" :
                    state.itemType === "category" ? "C" :
                        state.itemType === "inventory" ? "I" : "";
            if (currentElement.type === "text") {
                updatedElement.content = `${typeReference} - ${content.text}`;
            } else if (currentElement.type === "barcode") {
                updatedElement.value = `${typeReference}-${content.barcode}`;
            } else if (currentElement.type === "qr") {
                updatedElement.value = `${typeReference}-${content.qr}`;
            }

            updatedElements[selectedIndex] = updatedElement;
            dispatch({ type: "SET_ELEMENTS", payload: updatedElements });
        }
    }, [state.elements, state.selectedElement, state.itemType, generateSpecializedContent]);

    const handleValidateCode = useCallback(() => {
        const selectedElement = state.elements[state.selectedElement];
        if (!selectedElement) return;

        let isValid = true;
        let message = '';

        if (selectedElement.type === 'barcode') {
            try {
                const testSvg = document.createElement('svg');
                JsBarcode(testSvg, selectedElement.value, {
                    format: selectedElement.barcodeFormat || "CODE128",
                    width: 2,
                    height: 100,
                });
                message = 'Code-barres valide';
            } catch (error) {
                isValid = false;
                message = 'Code-barres invalide';
            }
        } else if (selectedElement.type === 'qr') {
            isValid = selectedElement.value.length > 0;
            message = isValid ? 'QR code valide' : 'QR code invalide';
        }

        dispatch({
            type: "SET_VALIDATION_RESULT",
            payload: { isValid, message },
        });
    }, [state.elements, state.selectedElement]);


    const handleBatchGenerate = useCallback((csvFile) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const csvContent = e.target.result.trim();
            const rows = csvContent.split("\n").map((row) => row.split(","));
            const headers = rows[0].map((header) => header.trim());
            const dataRows = rows.slice(1);

            // Remove all existing barcode and QR code elements
            const updatedElements = state.elements.filter((el) => el.type !== "barcode" && el.type !== "qr");
            const selectedElement = state.elements[state.selectedElement];

            if (!selectedElement) return;

            dataRows.forEach((row, index) => {
                const rowData = headers.reduce((acc, header, i) => {
                    acc[header] = row[i]?.trim() || ""; // Handle empty fields
                    return acc;
                }, {});

                const x = (index % 3) * state.selectedTicketSize.width * 37.8;
                const y = Math.floor(index / 3) * state.selectedTicketSize.height * 37.8;

                const newElement = {
                    ...selectedElement,
                    x,
                    y,
                    attributes: selectedElement.attributes || [],
                };

                if (selectedElement.type === "barcode") {
                    const attributeValues = newElement.attributes
                        .map((attr) => `{${attr.label}}`)
                        .join(" ");
                    newElement.value = `${rowData.SKU} ${attributeValues}`;
                } else if (selectedElement.type === "qr") {
                    const qrData = {
                        ...rowData,
                        type: state.itemType.toUpperCase(),
                        attributes: newElement.attributes.map((attr) => ({
                            label: attr.label,
                            value: attr.value,
                        })),
                    };
                    newElement.value = JSON.stringify(qrData);
                } else if (selectedElement.type === "text") {
                    const textValues = headers
                        .map((header) => `${header}: ${rowData[header]}`)
                        .join("\n");
                    newElement.content = textValues;
                }

                updatedElements.push(newElement);
            });

            dispatch({ type: "SET_ELEMENTS", payload: updatedElements });
        };

        reader.readAsText(csvFile);
    }, [state.elements, state.selectedElement, state.itemType, state.selectedTicketSize]);


    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleBatchGenerate(file);
        }
    };
    const debouncedUpdateElements = useMemo(
        () => debounce((newElements) => {
            dispatch({ type: "SET_ELEMENTS", payload: newElements });
        }, 200),
        []
    );


    const handlePrintPreview = useCallback(() => {
        const modal = document.createElement("div");
        modal.className = "print-preview-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "1000";

        const printContent = document.createElement("div");
        printContent.className = "qr-preview";
        const largerWidth = 30;
        const largerHeight = 15;

        printContent.style.width = `${largerWidth}cm`;
        printContent.style.height = `${largerHeight}cm`;
        printContent.style.backgroundColor = "white";
        printContent.style.position = "relative";
        printContent.style.overflow = "visible";

        const qrPreviewContent = previewRef.current.cloneNode(true);
        qrPreviewContent.style.width = "100%";
        qrPreviewContent.style.height = "100%";
        qrPreviewContent.style.position = "absolute";
        qrPreviewContent.style.left = "0";
        qrPreviewContent.style.top = "0";

        printContent.appendChild(qrPreviewContent);
        modal.appendChild(printContent);

        const closeModal = () => document.body.removeChild(modal);
        modal.addEventListener("click", closeModal);

        document.body.appendChild(modal);
    }, []);

    const handlePrint = useCallback(() => {
        if (!previewRef.current) return;

        const printFrame = document.createElement("iframe");
        printFrame.style.position = "absolute";
        printFrame.style.top = "-10000px";
        printFrame.style.left = "-10000px";
        document.body.appendChild(printFrame);

        const content = previewRef.current;
        const contentRect = content.getBoundingClientRect();

        const largerWidth = 30;
        const largerHeight = 15;
        const widthScale = largerWidth / (contentRect.width / 37.795);
        const heightScale = largerHeight / (contentRect.height / 37.795);
        const scale = Math.min(widthScale, heightScale) * 0.85;

        const doc = printFrame.contentDocument || printFrame.contentWindow.document;
        const qrPreviewContent = content.cloneNode(true);
        qrPreviewContent.className = "print-content";

        const styles = `
        @page {
            size: ${largerWidth}cm ${largerHeight}cm;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            width: ${largerWidth}cm;
            height: ${largerHeight}cm;
            overflow: hidden;
        }
        .print-content {
            transform: scale(${scale});
            transform-origin: center;
            position: relative;
            width: ${contentRect.width}px;
            height: ${contentRect.height}px;
        }
    `;

        doc.open();
        doc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <style>${styles}</style>
            </head>
            <body>${qrPreviewContent.outerHTML}</body>
        </html>
    `);
        doc.close();

        printFrame.contentWindow.focus();
        setTimeout(() => {
            printFrame.contentWindow.print();
            document.body.removeChild(printFrame);
        }, 500);
    }, []);


    const getTotalAttributesCount = () => {
        const uniqueAttributes = new Set();
        state.elements.forEach(element => {
            element.attributes?.forEach(attr => {
                uniqueAttributes.add(attr.value);
            });
        });
        return uniqueAttributes.size;
    };

    const getFilteredAttributes = () => DYNAMIC_ATTRIBUTES.filter(attr => attr.category === state.itemType);

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Select
                                        value={state.itemType}
                                        onChange={(e) => dispatch({ type: "SET_TYPE", payload: e.target.value })}
                                        className="category-select-folder"
                                    >
                                        <option value="product">Produit</option>
                                        <option value="category">Catégorie</option>
                                        <option value="inventory">Inventaire</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Select
                                        value={JSON.stringify(state.selectedTicketSize)}
                                        onChange={(e) => dispatch({ type: "SET_SIZE", payload: JSON.parse(e.target.value) })}
                                        className="category-select-folder"
                                    >
                                        {TICKET_SIZES.map((size, index) => (
                                            <option key={index} value={JSON.stringify(size)}>{size.label}</option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button" onClick={() => dispatch({ type: "SET_ELEMENTS", payload: [] })}>Effacer</Button>
                            <Button className="action-button" onClick={handlePrint}>Imprimer</Button>
                            <Button className="action-button" onClick={handleBack}>Retour</Button>
                        </Col>
                    </Row>
                    {showBarcodeTypeSelector && (
                        <div className="barcode-type-selector">
                            <label htmlFor="barcode-type">Choisir un type de code-barres :</label>
                            <select
                                id="barcode-type"
                                value={selectedBarcodeType}
                                onChange={(e) => setSelectedBarcodeType(e.target.value)}
                            >
                                {BARCODE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <Button
                                className="qr-tool-selector-button"
                                onClick={() => {
                                    const newElement = {
                                        type: "barcode",
                                        value: BARCODE_TYPES.find(t => t.type === selectedBarcodeType)?.placeholder || "Nouveau Code",
                                        format: selectedBarcodeType,
                                        x: 20,
                                        y: 200,
                                        width: 4,
                                        height: 2,
                                        attributes: [],
                                    };
                                    dispatch({ type: "SET_ELEMENTS", payload: [...state.elements, newElement] });
                                    setShowBarcodeTypeSelector(false);
                                }}
                            >
                                Ajouter
                            </Button>
                            <Button
                                className="qr-tool-selector-button"
                                onClick={() => setShowBarcodeTypeSelector(false)}
                            >
                                Annuler
                            </Button>
                        </div>
                    )}
                </Container>
            </div>
            <div className="configuration-Qr">
                <div className="qr-maker-container">
                    <div className="qr-tools">
                        <Button
                            className="qr-tool-button"
                            onClick={() => {
                                const content = generateSpecializedContent("product", "Produit Exemple");
                                const newElement = {
                                    type: "text",
                                    content: content.text,
                                    x: 20,
                                    y: 200,
                                    fontSize: 20,
                                    width: 4,
                                    height: 2,
                                    attributes: [],
                                };
                                dispatch({ type: "SET_ELEMENTS", payload: [...state.elements, newElement] });
                            }}
                        >
                            Ajouter Texte
                        </Button>
                        <button className="qr-tool-button" onClick={handleSmartGenerate}>Générateur Contenu</button>

                        <div className="qr-edit-field">
                            <div className="dynamic-attributes-container">
                                <div className="attributes-header">
                                    <label>Attributs disponibles ({getTotalAttributesCount()}/3):</label>
                                </div>
                                <div className="dynamic-attributes-grid">
                                    {getFilteredAttributes().map((attr, index) => (
                                        <button
                                            key={index}
                                            className={`attribute-button ${state.elements[state.selectedElement]?.attributes?.some(a => a.value === attr.value) ? 'selected' : ''}`}
                                            onClick={() => handleAttributeToggle(attr)}
                                            title={attr.label}
                                        >
                                            <span>{attr.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="qr-preview" ref={previewRef} style={{overflow: 'auto', minHeight: '400px'}}>
                        {state.validationResult && (
                            <div
                                className={`validation-message ${state.validationResult.isValid ? 'valid' : 'invalid'}`}>
                                {state.validationResult.message}
                            </div>
                        )}
                        {state.elements.map((element, index) => {
                            const MAX_WIDTH = state.selectedTicketSize.width * 37.8;

                            return (
                                <Rnd
                                    key={index}
                                    bounds=".qr-preview"
                                    size={{
                                        width: Math.min(element.width * 37.8, MAX_WIDTH),
                                        height: Math.min(element.height * 37.8, state.selectedTicketSize.height * 37.8)
                                    }}
                                    position={{ x: element.x, y: element.y }}
                                    onDragStop={(e, d) => {
                                        const updatedElements = [...state.elements];
                                        updatedElements[index] = { ...element, x: d.x, y: d.y };
                                        debouncedUpdateElements(updatedElements);
                                    }}
                                    onClick={() => dispatch({ type: "SET_SELECTED", payload: index })}
                                    enableResizing={{
                                        right: true,
                                        bottom: true,
                                        bottomRight: true
                                    }}
                                >
                                    {element.type === "text" && (
                                        <div style={{ fontSize: element.fontSize }}>{element.content}</div>
                                    )}
                                    {element.type === "qr" && (
                                        <QRCodeCanvas
                                            value={element.value || " "}
                                            size={Math.min(element.width * 37.8, MAX_WIDTH)}
                                        />
                                    )}
                                    {element.type === "barcode" && (
                                        <Barcode
                                            value={element.value || " "}
                                            width={Math.min(element.width, MAX_WIDTH / 37.8)}
                                            height={element.height}
                                            format={printer.format}
                                            attributes={element.attributes}
                                        />

                                    )}
                                </Rnd>
                            );
                        })}
                    </div>

                    <div className="qr-edit-panel">
                        <div className="qr-edit-field">
                            <label>Contenu :</label>
                            <div className="d-flex gap-2 mb-12 w-100">
                                <input
                                    type="text"
                                    value={state.elements[state.selectedElement]?.content || state.elements[state.selectedElement]?.value || ""}
                                    onChange={(e) => {
                                        const updatedElements = [...state.elements];
                                        if (updatedElements[state.selectedElement]) {
                                            const key = updatedElements[state.selectedElement].type === "text" ? "content" : "value";
                                            updatedElements[state.selectedElement] = {
                                                ...updatedElements[state.selectedElement],
                                                [key]: e.target.value
                                            };
                                            dispatch({type: "SET_ELEMENTS", payload: updatedElements});
                                        }
                                    }}
                                    style={{width: '100%'}}
                                />
                            </div>
                            <Button
                                className="qr-tool-button"
                                onClick={() => setShowBarcodeTypeSelector(true)}
                            >
                                Ajouter Code-barres
                            </Button>

                            <Button
                                className="qr-tool-button"
                                onClick={() => {
                                    const content = generateSpecializedContent("product", "Produit Exemple");
                                    const newElement = {
                                        type: "qr",
                                        value: content.qr,
                                        x: 20,
                                        y: 200,
                                        width: 4,
                                        height: 2,
                                        attributes: [],
                                    };
                                    dispatch({ type: "SET_ELEMENTS", payload: [...state.elements, newElement] });
                                }}
                            >
                                Ajouter QR Code
                            </Button>
                            <Button className="qr-tool-button" onClick={handleValidateCode}>Valider code</Button>
                            <div className="qr-tool-button csv-upload-button">
                                <label htmlFor="csv-upload">Importer CSV</label>
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    style={{display: "none"}}
                                    onChange={handleFileUpload}
                                />
                            </div>


                            <Button className="qr-tool-button" onClick={handlePrintPreview}>Aperçu Impression</Button>
                            <Button className="qr-tool-button" onClick={() => dispatch({type: "UNDO"})}
                                    disabled={!canUndo}>Annuler</Button>
                            <Button className="qr-tool-button" onClick={() => dispatch({type: "REDO"})}
                                    disabled={!canRedo}>Rétablir</Button>

                            <div className="qr-edit-field">
                                <label>Taille de police :</label>
                                <input
                                    type="number"
                                    value={state.elements[state.selectedElement]?.fontSize || 15}
                                    onChange={(e) => {
                                        const updatedElements = [...state.elements];
                                        if (updatedElements[state.selectedElement]) {
                                            updatedElements[state.selectedElement] = {
                                                ...updatedElements[state.selectedElement],
                                                fontSize: parseInt(e.target.value),
                                            };
                                            dispatch({type: "SET_ELEMENTS", payload: updatedElements});
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                className="qr-tool-button"
                            >
                                Sauvegarder le model
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}