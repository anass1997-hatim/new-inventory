import { useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import "../../CSS/printer.css";
import CreateQr from "../form/create_qr";

export default function UsePrinter() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const itemsPerPage = 6;
    const printerData = [
        {
            id: 1,
            name: "Printer 1",
            dimensions: "2.37 x 1.37",
            resolution: "300 dpi",
            time: "11/13/24 2:52 PM",
            qrCode: "https://via.placeholder.com/50",
        },
        {
            id: 2,
            name: "Printer 2",
            dimensions: "2.50 x 1.50",
            resolution: "300 dpi",
            time: "11/14/24 3:00 PM",
            qrCode: "https://via.placeholder.com/50",
        },
        {
            id: 3,
            name: "Printer 3",
            dimensions: "3.00 x 2.00",
            resolution: "400 dpi",
            time: "11/15/24 4:15 PM",
            qrCode: "https://via.placeholder.com/50",
        },
        {
            id: 4,
            name: "Printer 4",
            dimensions: "1.80 x 1.20",
            resolution: "250 dpi",
            time: "11/16/24 10:30 AM",
            qrCode: "https://via.placeholder.com/50",
        },
        {
            id: 5,
            name: "Printer 5",
            dimensions: "2.80 x 1.80",
            resolution: "350 dpi",
            time: "11/17/24 11:45 AM",
            qrCode: "https://via.placeholder.com/50",
        },
        {
            id: 6,
            name: "Printer 6",
            dimensions: "3.20 x 2.50",
            resolution: "450 dpi",
            time: "11/18/24 9:00 AM",
            qrCode: "https://via.placeholder.com/50",
        },
    ];

    const totalPages = Math.ceil(printerData.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePrinterClick = (printer) => {
        setSelectedPrinter(printer); // Set the clicked printer to navigate to CreateQr
    };

    const handleBackToGrid = () => {
        setSelectedPrinter(null);
    };

    const paginatedData = printerData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (selectedPrinter) {
        return <CreateQr printer={selectedPrinter} onBack={handleBackToGrid} />;
    }

    return (
        <>
            <div className="products-container">
                <Container>
                    <Row className="align-items-center justify-content-between">
                        <Col>
                            <InputGroup className="search-input-group">
                                <Form.Control
                                    placeholder="Rechercher models Impressions"
                                    aria-label="Search products"
                                    aria-describedby="button-addon2"
                                />
                                <Button variant="primary" id="button-addon2" title="Search">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button className="action-button">
                                <FaPlus /> Ajouter
                            </Button>
                            <Button className="action-button">
                                <label htmlFor="file-upload" style={{ cursor: "pointer", margin: 0 }}>
                                    Créer modèle
                                </label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".xlsx, .xls"
                                    style={{ display: "none" }}
                                />
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
                                <div
                                    className="printer-card"
                                    onClick={() => handlePrinterClick(printer)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <h5 className="printer-title">{printer.name}</h5>
                                    <p className="printer-dimensions">{printer.dimensions}</p>
                                    <p className="printer-resolution">{printer.resolution}</p>
                                    <p className="printer-time">{printer.time}</p>
                                    <div className="printer-preview">
                                        <img src={printer.qrCode} alt="QR Code" className="printer-qrcode" />
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
