import { useState, useEffect, useRef } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import "../../CSS/printer.css";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import CreateQr from "../form/create_qr";
import { useNavigate } from "react-router-dom";

    export default function UsePrinter() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const itemsPerPage = 6;
    const navigate = useNavigate();

        const printerData = [
            {
                id: 1,
                name: "Printer 1",
                dimensions: "2.37 x 1.37",
                resolution: "300 dpi",
                time: "11/13/24 2:52 PM",
                type: "CODE128",
                value: generateEAN13Checksum("123456789012"),
            },
            {
                id: 2,
                name: "Printer 2",
                dimensions: "2.50 x 1.50",
                resolution: "300 dpi",
                time: "11/14/24 3:00 PM",
                type: "CODE39",
                format: "CODE39",
                value: "CODE39EXAMPLE",
            },
            {
                id: 3,
                name: "Printer 3",
                dimensions: "3.00 x 2.00",
                resolution: "400 dpi",
                time: "11/15/24 4:15 PM",
                type: "EAN13",
                format: "EAN13",
                value: generateEAN13Checksum("123456789012"),
            },
            {
                id: 4,
                name: "Printer 4",
                dimensions: "3.00 x 2.00",
                resolution: "400 dpi",
                time: "11/15/24 4:15 PM",
                type: "QR",
                value: "https://example.com",
            },
            {
                id: 5,
                name: "Printer 5",
                dimensions: "3.00 x 2.00",
                resolution: "400 dpi",
                time: "11/15/24 4:15 PM",
                type: "EMPTY",
                value: "{Nom}",
            },
            {
                id: 6,
                name: "Printer 6",
                dimensions: "2.80 x 1.80",
                resolution: "350 dpi",
                time: "11/16/24 2:15 PM",
                type: "CODE128",
                value: "567890123456",
            },
        ];


    const totalPages = Math.ceil(printerData.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePrinterClick =  (printer = null) => {
        setSelectedPrinter(printer);
        navigate("/Printer/QrMaker", { state: { printer } });
    };

    const handleBackToGrid = () => {
        setSelectedPrinter(null)
    };

    const paginatedData = printerData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (selectedPrinter) {
        return <CreateQr printer={selectedPrinter}
                         format={selectedPrinter.type}
                         onBack={handleBackToGrid} />;
    }

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
                                    aria-describedby="button-addon2"
                                />
                                <Button variant="primary" id="button-addon2" title="Search">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button"
                                    onClick={() => handlePrinterClick({ type: "EMPTY", value: "" })}
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
                                        <BarcodeOrQr type={printer.type} value={printer.value}/>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            <div className="pagination-container">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    Précédent
                </button>
                <span>
                    Page {currentPage} sur {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Suivant
                </button>
            </div>
        </>
    );
}
function BarcodeOrQr({ type, value }) {
    const barcodeRef = useRef();

    useEffect(() => {
        if (type !== "QR" && type !== "EMPTY" && barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, value, { format: type });
            } catch (error) {
                console.error(`Invalid input for ${type}:`, error.message);
            }
        }
    }, [type, value]);

    if (type === "QR") {
        return <QRCodeCanvas value={value} size={100} />;
    } else if (type === "EMPTY") {
        return <div>{value}</div>;
    } else {
        return <svg ref={barcodeRef}></svg>;
    }
}
function generateEAN13Checksum(code) {
    if (code.length !== 12) {
        throw new Error("EAN13 requires the first 12 digits to calculate the checksum.");
    }
    const sum = code
        .split("")
        .map(Number)
        .reduce((acc, digit, idx) => {
            return acc + digit * (idx % 2 === 0 ? 1 : 3);
        }, 0);
    const checksum = (10 - (sum % 10)) % 10;
    return code + checksum;
}
