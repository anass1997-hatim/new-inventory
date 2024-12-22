import "../../CSS/label-print.css";
import Container from "react-bootstrap/Container";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import JsBarcode from "jsbarcode";

const TICKET_SIZES = [
    { label: "Petit (5x2.5cm)", width: 5, height: 2.5 },
    { label: "Moyen (7x4cm)", width: 7, height: 4 },
    { label: "Grand (10x5cm)", width: 10, height: 5 },
    { label: "Très grand (15x7cm)", width: 15, height: 7 },
];

const DYNAMIC_ATTRIBUTES = [
    { label: "Référence produit", value: "{ref_produit}", category: "product" },
    { label: "Nom produit", value: "{nom_produit}", category: "product" },
    { label: "Prix", value: "{prix}", category: "product" },
    { label: "Stock disponible", value: "{stock}", category: "product" },
    { label: "Emplacement", value: "{emplacement}", category: "product" },
    { label: "Date d'expiration", value: "{date_exp}", category: "product" },
    { label: "Code catégorie", value: "{code_cat}", category: "category" },
    { label: "Nom catégorie", value: "{nom_cat}", category: "category" },
    { label: "Nombre produits", value: "{nb_produits}", category: "category" },
    { label: "Responsable", value: "{responsable}", category: "category" },
    { label: "Code inventaire", value: "{code_inv}", category: "inventory" },
    { label: "Zone stockage", value: "{zone}", category: "inventory" },
    { label: "Quantité totale", value: "{quantite}", category: "inventory" },
    { label: "Date inventaire", value: "{date_inv}", category: "inventory" }
];

const generateSpecializedContent = (itemType, currentName) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const departments = ['Électronique', 'Vêtements', 'Alimentation', 'Mobilier', 'Sport'];
    const locations = ['A', 'B', 'C', 'D', 'E'];
    const conditions = ['Neuf', 'Occasion', 'Réparé', 'Premium'];

    if (itemType === "product") {
        const price = (Math.random() * 1000).toFixed(2);
        const department = departments[Math.floor(Math.random() * departments.length)];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        return {
            text: `${currentName || "Nouveau Produit"}\nDépartement: ${department}\nÉtat: ${condition}\nPrix: ${price}€\nRef: P${randomId}`,
            barcode: `P${dateStr}${randomId}`,
            qr: JSON.stringify({
                type: "PRODUCT",
                id: `P${randomId}`,
                name: currentName || "Nouveau Produit",
                department: department,
                condition: condition,
                price: price,
                dateCreated: dateStr,
                lastModified: dateStr,
                manufacturer: "MFG-" + Math.floor(Math.random() * 1000),
                stockLevel: Math.floor(Math.random() * 100)
            })
        };
    }

    if (itemType === "category") {
        const mainDept = departments[Math.floor(Math.random() * departments.length)];
        const subCategories = Math.floor(Math.random() * 5) + 2;
        return {
            text: `${currentName || "Nouvelle Catégorie"}\nDépartement: ${mainDept}\nSous-catégories: ${subCategories}\nRef: C${randomId}`,
            barcode: `C${dateStr}${randomId}`,
            qr: JSON.stringify({
                type: "CATEGORY",
                id: `C${randomId}`,
                name: currentName || "Nouvelle Catégorie",
                department: mainDept,
                subCategories: subCategories,
                totalProducts: Math.floor(Math.random() * 1000),
                dateCreated: dateStr,
                lastModified: dateStr,
                responsibleManager: "MGR-" + Math.floor(Math.random() * 100),
                status: "Active"
            })
        };
    }

    const location = locations[Math.floor(Math.random() * locations.length)];
    const shelf = Math.floor(Math.random() * 20) + 1;
    const quantity = Math.floor(Math.random() * 1000);
    return {
        text: `Dossier: ${currentName || "Stock"}\nZone: ${location}-${shelf}\nQuantité: ${quantity}\nRef: D${randomId}`,
        barcode: `D${dateStr}${randomId}`,
        qr: JSON.stringify({
            type: "INVENTORY",
            id: `D${randomId}`,
            name: currentName || "Stock",
            location: `${location}-${shelf}`,
            quantity: quantity,
            dateCreated: dateStr,
            lastInventory: dateStr,
            securityLevel: Math.floor(Math.random() * 3) + 1,
            handler: "EMP-" + Math.floor(Math.random() * 1000),
            status: "En stock"
        })
    };
};

export default function CreateQr({ printer, onBack }) {
    const [elements, setElements] = useState(() => {
        if (printer) {
            return [{
                type: printer.type === "QR" ? "qr" : printer.type === "EMPTY" ? "text" : "barcode",
                content: printer.type === "EMPTY" ? printer.value : "",
                value: printer.value,
                x: 50,
                y: 50,
                fontSize: 24,
                width: 4,
                height: 2,
                attributes: []
            }];
        }
        return [];
    });

    const [itemType, setItemType] = useState("product");
    const [selectedElement, setSelectedElement] = useState(0);
    const [selectedTicketSize, setSelectedTicketSize] = useState(TICKET_SIZES[0]);
    const previewRef = useRef();

    const handleAttributeToggle = (attr) => {
        const updatedElements = elements.map(element => {
            const attrIndex = element.attributes?.findIndex(a => a.value === attr.value);

            // If attribute doesn't exist and we haven't reached the limit
            if (attrIndex === -1 && (!element.attributes || element.attributes.length < 3)) {
                const newAttributes = [...(element.attributes || []), attr];
                const key = element.type === "text" ? "content" : "value";

                // For barcodes and QR codes, we'll maintain their base value
                let baseValue = element[key];
                if (element.type !== "text") {
                    // Remove any existing attributes from the base value
                    DYNAMIC_ATTRIBUTES.forEach(dynAttr => {
                        baseValue = baseValue.replace(dynAttr.value, "").trim();
                    });
                }

                // Construct new value with all attributes
                const newValue = [baseValue, ...newAttributes.map(a => a.value)].filter(Boolean).join(" ");

                return {
                    ...element,
                    attributes: newAttributes,
                    [key]: newValue,
                    // Maintain original dimensions for barcodes and QR codes
                    width: element.type !== "text" ? (element.width || 4) : element.width,
                    height: element.type !== "text" ? (element.height || 2) : element.height
                };
            }

            // If attribute exists, remove it
            if (attrIndex !== -1) {
                const newAttributes = element.attributes.filter(a => a.value !== attr.value);
                const key = element.type === "text" ? "content" : "value";

                // Remove the attribute from the value while maintaining other attributes
                let baseValue = element[key];
                DYNAMIC_ATTRIBUTES.forEach(dynAttr => {
                    baseValue = baseValue.replace(dynAttr.value, "").trim();
                });

                const newValue = [baseValue, ...newAttributes.map(a => a.value)].filter(Boolean).join(" ");

                return {
                    ...element,
                    attributes: newAttributes,
                    [key]: newValue
                };
            }

            return element;
        });

        setElements(updatedElements);
    };

    // Update the attributes display to show total count across all elements
    const getTotalAttributesCount = () => {
        const uniqueAttributes = new Set();
        elements.forEach(element => {
            element.attributes?.forEach(attr => {
                uniqueAttributes.add(attr.value);
            });
        });
        return uniqueAttributes.size;
    };
    const getFilteredAttributes = () => DYNAMIC_ATTRIBUTES.filter(attr => attr.category === itemType);

    const validateDimensions = (width, height, ticketSize) => ({
        width: Math.max(0.1, Math.min(width, ticketSize.width)),
        height: Math.max(0.1, Math.min(height, ticketSize.height))
    });

    const handleUpdateElementSize = (type, value) => {
        const updatedElements = [...elements];
        const element = updatedElements[selectedElement];
        if (!element) return;

        const validatedDimensions = validateDimensions(
            type === 'width' ? value : element.width,
            type === 'height' ? value : element.height,
            selectedTicketSize
        );

        element.width = validatedDimensions.width;
        element.height = validatedDimensions.height;
        setElements(updatedElements);
    };

    const handleSmartGenerate = () => {
        const updatedElements = [...elements];
        const currentName = elements[selectedElement]?.content || elements[selectedElement]?.value || "";

        updatedElements.forEach((element) => {
            const content = generateSpecializedContent(itemType, currentName);
            if (element.type === "barcode") {
                element.value = content.barcode;
            } else if (element.type === "qr") {
                element.value = content.qr;
            } else if (element.type === "text") {
                element.content = content.text;
            }
        });

        setElements(updatedElements);
    };

    const handleAddElement = (type) => {
        const newElement = {
            type,
            content: type === "text" ? "{text}" : "",
            value: "",
            x: 20,
            y: 200,
            fontSize: 20,
            width: 4,
            height: 2,
            attributes: []
        };
        setElements([...elements, newElement]);
        setSelectedElement(elements.length);
    };

    const handleRemoveElement = () => {
        if (elements.length > 1) {
            const updatedElements = elements.filter((_, index) => index !== selectedElement);
            setElements(updatedElements);
            setSelectedElement(Math.max(0, selectedElement - 1));
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <div style="width: ${selectedTicketSize.width}cm; height: ${selectedTicketSize.height}cm; position: relative;">
                ${elements.map(element => {
            if (element.type === 'text') {
                return `<div style="position: absolute; left: ${element.x}px; top: ${element.y}px; font-size: ${element.fontSize}px;">${element.content}</div>`;
            }
            if (element.type === 'qr') {
                const canvas = document.querySelector(`canvas[value="${element.value}"]`);
                const qrImage = canvas?.toDataURL();
                return qrImage ? `<div style="position: absolute; left: ${element.x}px; top: ${element.y}px;"><img src="${qrImage}" alt="QR Code" /></div>` : '';
            }
            if (element.type === 'barcode') {
                const barcodeSVG = document.querySelector(`[value="${element.value}"]`)?.outerHTML;
                return `<div style="position: absolute; left: ${element.x}px; top: ${element.y}px;">${barcodeSVG || ''}</div>`;
            }
            return '';
        }).join('')}
            </div>
        `;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label</title>
                    <style>
                        @page { size: ${selectedTicketSize.width}cm ${selectedTicketSize.height}cm; margin: 0; }
                        body { margin: 0; padding: 0; }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Select value={itemType} onChange={(e) => setItemType(e.target.value)} className="category-select-folder">
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
                                    <Form.Select value={JSON.stringify(selectedTicketSize)} onChange={(e) => setSelectedTicketSize(JSON.parse(e.target.value))} className="category-select-folder">
                                        {TICKET_SIZES.map((size, index) => (
                                            <option key={index} value={JSON.stringify(size)}>{size.label}</option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button" onClick={() => setElements([])}>Effacer</Button>
                            <Button className="action-button" onClick={handlePrint}>Imprimer</Button>
                            <Button className="action-button" onClick={onBack}>Retour</Button>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="configuration-Qr">
                <div className="qr-maker-container">
                    <div className="qr-tools">
                        <button className="qr-tool-button" onClick={() => handleAddElement("text")}>Ajouter Texte</button>
                        <button className="qr-tool-button" onClick={() => handleAddElement("barcode")}>Ajouter Code-barres</button>
                        <button className="qr-tool-button" onClick={() => handleAddElement("qr")}>Ajouter QR Code</button>
                        <button className="qr-tool-button" onClick={handleSmartGenerate}>Générerateur Contenu</button>
                        <button className="qr-tool-button" onClick={handleRemoveElement}>Supprimer le bloc</button>

                        <div className="qr-edit-field">
                            <label>Attributs disponibles ({getTotalAttributesCount()}/3):</label>
                            <div className="dynamic-attributes">
                                {getFilteredAttributes().map((attr, index) => (
                                    <button
                                        key={index}
                                        className={`attribute-button ${elements[selectedElement]?.attributes?.some(a => a.value === attr.value) ? 'selected' : ''}`}
                                        onClick={() => handleAttributeToggle(attr)}
                                    >
                                        {attr.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="qr-preview" ref={previewRef} style={{ overflow: 'auto', minHeight: '400px' }}>
                        {elements.map((element, index) => (
                            <Rnd
                                key={index}
                                bounds=".qr-preview"
                                size={{
                                    width: Math.min(element.width * 37.8, selectedTicketSize.width * 37.8),
                                    height: Math.min(element.height * 37.8, selectedTicketSize.height * 37.8)
                                }}
                                position={{ x: element.x, y: element.y }}
                                onDragStop={(e, d) => {
                                    const updatedElements = [...elements];
                                    updatedElements[index].x = d.x;
                                    updatedElements[index].y = d.y;
                                    setElements(updatedElements);
                                }}
                                onClick={() => setSelectedElement(index)}
                                enableResizing={{
                                    top: false,
                                    right: true,
                                    bottom: true,
                                    left: false,
                                    topRight: true,
                                    bottomRight: true,
                                    bottomLeft: false,
                                    topLeft: false,
                                }}
                            >
                                {element.type === "text" && (
                                    <div style={{ fontSize: element.fontSize }}>{element.content}</div>
                                )}
                                {element.type === "qr" && (
                                    <QRCodeCanvas value={element.value || " "} size={element.width * 37.8} />
                                )}
                                {element.type === "barcode" && (
                                    <Barcode value={element.value || " "} width={element.width} height={element.height} />
                                )}
                            </Rnd>
                        ))}
                    </div>

                    <div className="qr-edit-panel">
                        <div className="qr-edit-field">
                            <label>Contenu :</label>
                            <div className="d-flex gap-2 mb-12 w-100">
                                <input
                                    type="text"
                                    value={elements[selectedElement]?.content || elements[selectedElement]?.value || ""}
                                    onChange={(e) => {
                                        const key = elements[selectedElement]?.type === "text" ? "content" : "value";
                                        const updatedElements = [...elements];
                                        updatedElements[selectedElement][key] = e.target.value;
                                        setElements(updatedElements);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            {(elements[selectedElement]?.type === 'barcode' || elements[selectedElement]?.type === 'qr') && (
                                <div className="dimension-controls">
                                    <div className="dimension-control">
                                        <label>Largeur:</label>
                                        <input
                                            type="number"
                                            value={elements[selectedElement]?.width || 0}
                                            onChange={(e) => handleUpdateElementSize('width', Math.max(0.1, parseFloat(e.target.value)))}
                                            min="0.1"
                                            max={selectedTicketSize.width}
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="dimension-control">
                                        <label>Hauteur:</label>
                                        <input
                                            type="number"
                                            value={elements[selectedElement]?.height || 0}
                                            onChange={(e) => handleUpdateElementSize('height', Math.max(0.1, parseFloat(e.target.value)))}
                                            min="0.1"
                                            max={selectedTicketSize.height}
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {elements[selectedElement]?.type === "text" && (
                            <div className="qr-edit-field">
                                <label>Taille de police :</label>
                                <input
                                    type="number"
                                    value={elements[selectedElement]?.fontSize || 24}
                                    onChange={(e) => {
                                        const updatedElements = [...elements];
                                        updatedElements[selectedElement].fontSize = parseInt(e.target.value);
                                        setElements(updatedElements);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Barcode({ value, width, height }) {
    const barcodeRef = useRef();

    useEffect(() => {
        if (barcodeRef.current && value) {
            try {
                JsBarcode(barcodeRef.current, value, {
                    format: "CODE128",
                    width: width,
                    height: height * 37.8,
                    displayValue: true
                });
            } catch (error) {
                console.error("Invalid barcode value:", error);
            }
        }
    }, [value, width, height]);

    return <svg ref={barcodeRef}></svg>;
}