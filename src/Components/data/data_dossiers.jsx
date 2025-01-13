import React, { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/dossiers_data.css";
import { FaFolder, FaEdit, FaTrash, FaLink, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import DossierAssociationPanel from "../associations/associations_dossiers";

export default function DisplayDossiersData({ data = [], hiddenColumns = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [showAssociationPanel, setShowAssociationPanel] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const rowsPerPage = 7;

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleAssociate = (dossier) => {
        setSelectedDossier(dossier);
        setShowAssociationPanel(true);
    };

    const isColumnHidden = (column) => hiddenColumns.includes(column);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue, bValue;

        if (sortConfig.key === "Dossier") {
            aValue = a["Nom du dossier"] || "";
            bValue = b["Nom du dossier"] || "";
        } else {
            aValue = a[sortConfig.key] || "";
            bValue = b[sortConfig.key] || "";
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        } else {
            return sortConfig.direction === "asc"
                ? aValue.toString().localeCompare(bValue.toString())
                : bValue.toString().localeCompare(aValue.toString());
        }
    });

    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderSortIcon = (column) => {
        const sortColumn = column === "Produit" ? "Titre" : column;
        if (sortConfig.key !== sortColumn) return <FaSort className="sort-icon" />;
        return sortConfig.direction === "asc" ? (
            <FaSortUp className="sort-icon" />
        ) : (
            <FaSortDown className="sort-icon" />
        );
    };


    const sampleCategories = [
        {
            id: 1,
            name: "Category 1",
            subCategories: [
                {
                    id: 11,
                    name: "SubCategory 1.1",
                    products: [
                        { id: 111, name: "Product 1.1.1" },
                        { id: 112, name: "Product 1.1.2" },
                    ],
                },
                {
                    id: 12,
                    name: "SubCategory 1.2",
                    products: [
                        { id: 121, name: "Product 1.2.1" },
                        { id: 122, name: "Product 1.2.2" },
                    ],
                },
            ],
        },
        {
            id: 2,
            name: "Category 2",
            subCategories: [
                {
                    id: 21,
                    name: "SubCategory 2.1",
                    products: [
                        { id: 211, name: "Product 2.1.1" },
                        { id: 212, name: "Product 2.1.2" },
                    ],
                },
            ],
        },
    ];

    return (
        <>
            <div className="dossiers-data-container">
                <Table hoverable={true} striped={true}>
                    <thead>
                    <tr>
                        <th></th>
                        {!isColumnHidden("Identifiant") && (
                            <th onClick={() => handleSort("Identifiant")}>Identifiant {renderSortIcon("Identifiant")}</th>
                        )}
                        {!isColumnHidden("Dossier") && (
                            <th onClick={() => handleSort("Nom du dossier")}>Dossier {renderSortIcon("Dossier")}</th>
                        )}
                        {!isColumnHidden("Emplacement") && (
                            <th onClick={() => handleSort("Emplacement")}>Emplacement {renderSortIcon("Emplacement")}</th>
                        )}
                        {!isColumnHidden("Description") && (
                            <th onClick={() => handleSort("Description")}>Description {renderSortIcon("Description")}</th>
                        )}
                        {!isColumnHidden("Permission") && (
                            <th onClick={() => handleSort("Permission")}>Permission {renderSortIcon("Permission")}</th>
                        )}
                        {!isColumnHidden("Créé le") && (
                            <th onClick={() => handleSort("Créé le")}>Créé le {renderSortIcon("Créé le")}</th>
                        )}
                        <th>Associer</th>
                        <th>Modifier</th>
                        <th>Supprimer</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="text-center">
                                Aucun dossier disponible à afficher.
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>
                                    <div className="folder-icon">
                                        <FaFolder />
                                    </div>
                                </td>
                                {!isColumnHidden("Identifiant") && <td>{row.Identifiant || "-"}</td>}
                                {!isColumnHidden("Dossier") && (
                                    <td>
                                        {!isColumnHidden("Nom du dossier") &&
                                            (row["Nom du dossier"] || "-")}
                                        {!isColumnHidden("Nom du dossier") &&
                                            !isColumnHidden("Code-barres") &&
                                            " | "}
                                        {!isColumnHidden("Code-barres") && (row["Code-barres"] || "-")}
                                    </td>
                                )}
                                {!isColumnHidden("Emplacement") && <td>{row.Emplacement || "-"}</td>}
                                {!isColumnHidden("Description") && <td>{row.Description || "-"}</td>}
                                {!isColumnHidden("Permission") && <td>{row.Permission || "-"}</td>}
                                {!isColumnHidden("Créé le") && <td>{row["Créé le"] || "-"}</td>}
                                <td>
                                    <button
                                        className="associate-button-folder"
                                        aria-label="Associer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssociate(row);
                                        }}
                                    >
                                        <FaLink />
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="edit-button-folder"
                                        aria-label="Modifier"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FaEdit />
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="delete-button-folder"
                                        aria-label="Supprimer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
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
            </div>
            {selectedDossier && (
                <DossierAssociationPanel
                    show={showAssociationPanel}
                    onHide={() => setShowAssociationPanel(false)}
                    dossierId={selectedDossier.Identifiant}
                    categories={sampleCategories}
                    onSave={(associations) => {
                        console.log("Saved Associations:", associations);
                        setShowAssociationPanel(false);
                    }}
                    associatedData={{
                        categories: [],
                        subCategories: [],
                        products: [],
                    }}
                />
            )}
        </>
    );
}