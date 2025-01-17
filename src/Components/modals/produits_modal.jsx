import React, { useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import "../../CSS/ValidationModalProduits.css";
import { useProductContext } from "../context/ProductContext";

const ValidationModal = ({
                             show,
                             onHide,
                             validationSummary,
                             necessaryFields,
                             optionalFields,
                             parsedData,
                         }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [uploadStatus, setUploadStatus] = useState("");
    const [submissionErrors, setSubmissionErrors] = useState([]);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(parsedData.length / rowsPerPage);

    const { refreshProducts } = useProductContext();

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedRows = parsedData.slice(startIndex, endIndex);

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleConfirmImport = async () => {
        setUploadStatus("Téléchargement en cours...");
        setSubmissionErrors([]);

        const allowedTypes = ["Revente", "Immobilisation", "Equipement"];
        const allowedUniteTypes = ["Pièce", "Douzaine"];

        const typeErrors = new Set();
        const uniteTypeErrors = new Set();

        const filteredData = parsedData.map((row, index) => {
            if (!allowedTypes.includes(row["Type"])) {
                typeErrors.add(row["Type"]);
            }

            if (!allowedUniteTypes.includes(row["Unité Type"])) {
                uniteTypeErrors.add(row["Unité Type"]);
            }

            let champsPersonnalises = null;
            if (
                row["Sous Catégorie"] ||
                row["Marque"] ||
                row["Model"] ||
                row["Famille"] ||
                row["Sous Famille"] ||
                row["Taille"] ||
                row["Couleur"] ||
                row["Poids"] ||
                row["Volume"] ||
                row["Dimensions"]
            ) {
                champsPersonnalises = {
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

            return {
                reference: row["Référence"],
                type: row["Type"],
                codeBarres: row["Code Barres"],
                uniteType: row["Unité Type"],
                prixVenteTTC: parseFloat(row["Prix Vente TTC"]),
                description: row["Description"],
                categorie: {
                    idCategorie: row["Catégorie"],
                    categorie: row["Catégorie"]
                },
                depot: {
                    idDepot: row["Dépôt"],
                    depot: row["Dépôt"]
                },
                dateAffectation: row["Date Affectation"],
                datePeremption: row["Date Péremption"],
                quantite: row["Quantité"],
                codeRFID: row["Code RFID"],
                champsPersonnalises: champsPersonnalises
            };
        });

        const errors = [];
        if (typeErrors.size > 0) {
            errors.push(
                `Type invalide: ${Array.from(typeErrors).join(", ")}. Les valeurs autorisées sont: ${allowedTypes.join(", ")}.`
            );
        }
        if (uniteTypeErrors.size > 0) {
            errors.push(
                `Unité Type invalide: ${Array.from(uniteTypeErrors).join(", ")}. Les valeurs autorisées sont: ${allowedUniteTypes.join(", ")}.`
            );
        }

        if (errors.length > 0) {
            setSubmissionErrors(errors);
            setUploadStatus("Échec de la validation des données.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/produits/upload/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: filteredData }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.validation_errors) {
                    const errorMessages = result.validation_errors.map((error) => {
                        const rowData = error.data;
                        const errorDetails = Object.entries(error.errors)
                            .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
                            .join("; ");
                        return `Ligne concernée (${JSON.stringify(rowData)}): ${errorDetails}`;
                    });
                    setSubmissionErrors(errorMessages);
                    setUploadStatus(
                        `Échec du téléchargement : ${errorMessages.length} erreur(s) détectée(s).`
                    );
                } else {
                    setUploadStatus(
                        `Échec du téléchargement : ${result.message || "Erreur inconnue."}`
                    );
                }
            } else {
                const productsCount = result.count || filteredData.length;
                setUploadStatus(
                    `Succès ! ${productsCount} produit(s) créé(s) avec succès.`
                );
                refreshProducts();
                setTimeout(() => {
                    onHide();
                }, 2000);
            }
        } catch (error) {
            setUploadStatus("Erreur lors du téléchargement. Veuillez réessayer.");
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            className="products-modals"
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Validation des Données</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {uploadStatus && (
                    <div
                        className={`alert ${
                            uploadStatus.includes("Succès") ? "alert-success" : "alert-info"
                        }`}
                    >
                        {uploadStatus}
                    </div>
                )}

                {submissionErrors.length > 0 ? (
                    <div className="alert alert-danger">
                        <h6>Erreurs lors du téléchargement :</h6>
                        <ul className="error-list">
                            {submissionErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ) : validationSummary.length > 0 ? (
                    <div className="alert alert-warning">
                        <h6>Problèmes détectés lors de l'importation :</h6>
                        <ul className="error-list">
                            {validationSummary.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Les données sont valides et prêtes pour l'importation.</p>
                )}

                <div className="table-responsive">
                    <Table>
                        <thead>
                        <tr>
                            {necessaryFields.concat(optionalFields).map((field) => (
                                <th key={field}>{field}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {displayedRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {necessaryFields.concat(optionalFields).map((field) => (
                                    <td key={field}>{row[field] || "-"}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                </div>

                <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
                    <Button
                        variant="outline-primary"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Précédent
                    </Button>
                    <span>
            Page {currentPage} sur {totalPages}
          </span>
                    <Button
                        variant="outline-primary"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Suivant
                    </Button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    disabled={uploadStatus === "Téléchargement en cours..."}
                >
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirmImport}
                    disabled={
                        validationSummary.length > 0 ||
                        uploadStatus === "Téléchargement en cours..."
                    }
                >
                    Confirmer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ValidationModal;
