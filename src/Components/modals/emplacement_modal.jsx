import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import "../../CSS/ValidationModalEmplacements.css";

const ValidationModalEmplacements = ({
                                         show,
                                         onHide,
                                         validationSummary,
                                         necessaryFields,
                                         optionalFields,
                                         parsedData,
                                         onConfirm,
                                     }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Maximum 10 rows per page
    const totalPages = Math.ceil(parsedData.length / rowsPerPage);

    // Calculate the rows to display on the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedRows = parsedData.slice(startIndex, endIndex);

    // Handle page navigation
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            className="emplacements-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Validation des Données des Emplacements</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {validationSummary.length > 0 ? (
                    <div>
                        <h5>Problèmes détectés :</h5>
                        <ul className="error-list">
                            {validationSummary.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Les données des emplacements sont valides et prêtes pour l'importation.</p>
                )}
                <Table>
                    <thead>
                    <tr>
                        {necessaryFields.concat(optionalFields || []).map((field) => (
                            <th key={field}>{field}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {displayedRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {necessaryFields.concat(optionalFields || []).map((field) => (
                                <td key={field}>{row[field] || "-"}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
                    <button
                        className={`pagination-buttons ${currentPage === 1 ? "active" : ""}`}
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Précédent
                    </button>
                    <span>
                        Page {currentPage} sur {totalPages}
                    </span>
                    <button
                        className={`pagination-buttons ${currentPage === totalPages ? "active" : ""}`}
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Suivant
                    </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={onConfirm}
                    disabled={validationSummary.length > 0}
                >
                    Confirmer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ValidationModalEmplacements;
