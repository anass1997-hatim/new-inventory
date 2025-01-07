import { useState, useEffect, useRef } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import "../../CSS/printer.css";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";

export default function UsePrinter() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    const printerData = [
        {
            id: 1,
            name: "Printer 1",
            dimensions: "2.37 x 1.37",
            resolution: "300 dpi",
            time: "11/13/24 2:52 PM",
            type: "barcode",
            format: "CODE128",
            value: "ABC123456789"
        },
        {
            id: 2,
            name: "Printer 2",
            dimensions: "2.50 x 1.50",
            resolution: "300 dpi",
            time: "11/14/24 3:00 PM",
            type: "barcode",
            format: "CODE39",
            value: "CODE39TEST"
        },
        {
            id: 3,
            name: "Printer 3",
            dimensions: "3.00 x 2.00",
            resolution: "400 dpi",
            time: "11/15/24 4:15 PM",
            type: "barcode",
            format: "EAN13",
            value: "1234567890128"
        },
        {
            id: 4,
            name: "Printer 4",
            dimensions: "3.00 x 2.00",
            resolution: "400 dpi",
            time: "11/15/24 4:15 PM",
            type: "QR",
            value: "https://example.com"
        },
        {
            id: 5,
            name: "Printer 5",
            dimensions: "3.00 x 2.00",
            resolution: "400 dpi",
            time: "11/15/24 4:15 PM",
            type: "EMPTY",
            value: "{Nom}"
        },
        {
            id: 6,
            name: "Printer 6",
            dimensions: "2.75 x 1.75",
            resolution: "300 dpi",
            time: "11/16/24 10:30 AM",
            type: "barcode",
            format: "MSI",
            value: "123456789012"
        }
    ];

    const handlePrinterClick = (printer = null) => {
        const printerWithFormat = printer ? {
            ...printer,
            type: printer.type,
            format: printer.format || "CODE128",
            value: printer.value || "",
            content: printer.type === "EMPTY" ? printer.value : "",
            fontSize: 24,
            width: 4,
            height: 2,
            x: 50,
            y: 50,
            attributes: []
        } : {
            type: "EMPTY",
            value: "",
            content: "",
            fontSize: 24,
            width: 4,
            height: 2,
            x: 50,
            y: 50,
            attributes: []
        };

        navigate("/Printer/QrMaker", {
            state: {
                printer: printerWithFormat
            }
        });
    };

    const BarcodeOrQr = ({ type, value, format }) => {
        const barcodeRef = useRef();

        useEffect(() => {
            if (type === "barcode" && barcodeRef.current) {
                try {
                    // Define format-specific options
                    const barcodeOptions = {
                        width: 2,
                        height: 100,
                        displayValue: true,
                        fontSize: 16,
                        marginTop: 10,
                        marginBottom: 10,
                        format: format
                    };

                    // Add format-specific validations and modifications
                    if (format === "EAN13") {
                        // Ensure value is exactly 12 or 13 digits (EAN13 requires 12 digits + optional check digit)
                        const cleanValue = value.replace(/[^\d]/g, '').slice(0, 13);
                        if (cleanValue.length < 12) {
                            throw new Error("EAN13 requires at least 12 digits");
                        }
                        barcodeOptions.format = "EAN13";
                        JsBarcode(barcodeRef.current, cleanValue, barcodeOptions);
                    } else if (format === "CODE39") {
                        barcodeOptions.format = "CODE39";
                        JsBarcode(barcodeRef.current, value, barcodeOptions);
                    } else if (format === "MSI") {
                        const cleanValue = value.replace(/[^\d]/g, '');
                        barcodeOptions.format = "MSI";
                        JsBarcode(barcodeRef.current, cleanValue, barcodeOptions);
                    } else {
                        // Default to CODE128 for other formats
                        barcodeOptions.format = "CODE128";
                        JsBarcode(barcodeRef.current, value, barcodeOptions);
                    }
                } catch (error) {
                    console.error("Barcode generation error:", error);
                    // Clear the SVG content in case of error
                    if (barcodeRef.current) {
                        barcodeRef.current.innerHTML = '';
                    }
                }
            }
        }, [type, value, format]);

        if (type === "QR") {
            return (
                <div style={{ width: '100px', height: '100px', margin: 'auto' }}>
                    <QRCodeCanvas
                        value={value || "Empty QR"}
                        size={100}
                        level="M"
                        includeMargin={true}
                    />
                </div>
            );
        }
        if (type === "EMPTY") {
            return <h4 style={{ margin: '20px 0' }}>{value || "{Nom}"}</h4>;
        }
        return (
            <svg
                ref={barcodeRef}
                style={{
                    height: '100px',
                    width: '100%',
                    margin: 'auto',
                    display: 'block'
                }}
            />
        );
    };

    const paginatedData = printerData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(printerData.length / itemsPerPage);

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col>
                            <InputGroup className="search-input-group">
                                <Form.Control
                                    placeholder="Rechercher modèles d'impressions"
                                    aria-label="Search models"
                                />
                                <Button variant="primary" id="button-addon2" title="Search">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                className="action-button"
                                onClick={() => handlePrinterClick()}
                            >
                                <FaPlus /> Ajouter
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="printer-grid">
                <Container>
                    <Row>
                        {paginatedData.map((printer) => (
                            <Col key={printer.id} md={4} className="grid-item">
                                <div className="printer-card" onClick={() => handlePrinterClick(printer)}>
                                    <h5 className="printer-title">{printer.name}</h5>
                                    <div className="printer-details">
                                        <p>{printer.dimensions}</p>
                                        <p>{printer.resolution}</p>
                                    </div>
                                    <p className="printer-time">{printer.time}</p>
                                    <div className="printer-preview">
                                        <BarcodeOrQr {...printer} />
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            <div className="pagination-container">
                <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    Précédent
                </button>
                <span>Page {currentPage} sur {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Suivant
                </button>
            </div>
        </>
    );
}