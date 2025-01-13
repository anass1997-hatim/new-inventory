import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/produits_data.css";
import { FaBox, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function DisplayProduitsData({ data = [], hiddenColumns = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const rowsPerPage = 7;

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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

        if (sortConfig.key === "Produit") {
            aValue = a["Titre"] || "";
            bValue = b["Titre"] || "";
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


    return (
        <div className="folders-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th></th>
                    {!isColumnHidden("Identifiant") && (
                        <th onClick={() => handleSort("Identifiant")}>Identifiant {renderSortIcon("Identifiant")}</th>
                    )}
                    {!isColumnHidden("Produit") && (
                        <th onClick={() => handleSort("Titre")}>Produit {renderSortIcon("Produit")}</th>
                    )}
                    {!isColumnHidden("Quantité") && (
                        <th onClick={() => handleSort("Quantité")}>Quantité {renderSortIcon("Quantité")}</th>
                    )}
                    {!isColumnHidden("Prix") && (
                        <th onClick={() => handleSort("Prix")}>Prix {renderSortIcon("Prix")}</th>
                    )}
                    {!isColumnHidden("Quantité Disponible") && (
                        <th onClick={() => handleSort("Quantité Disponible")}>Quantité Disponible {renderSortIcon("Quantité Disponible")}</th>
                    )}
                    {!isColumnHidden("Date de Création") && (
                        <th onClick={() => handleSort("Date de Création")}>Date de Création {renderSortIcon("Date de Création")}</th>
                    )}
                    {!isColumnHidden("Date d'expiration") && (
                        <th onClick={() => handleSort("Date d'expiration")}>Date d'expiration {renderSortIcon("Date d'expiration")}</th>
                    )}
                    {!isColumnHidden("Créé par") && (
                        <th onClick={() => handleSort("Créé par")}>Créé par {renderSortIcon("Créé par")}</th>
                    )}
                    <th>Modifier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="10" className="text-center">
                            Aucune donnée disponible à afficher.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>
                                <div className="product-icon">
                                    <FaBox />
                                </div>
                            </td>
                            {!isColumnHidden("Identifiant") && <td>{row.Identifiant || "-"}</td>}
                            {!isColumnHidden("Produit") && (
                                <td>
                                    {row.Titre || "-"} |
                                    {!isColumnHidden("Code-barres") && ` ${row["Code-barres"] || "-"} |`}
                                    {!isColumnHidden("Catégorie") && ` ${row.Catégorie || "-"}`}
                                </td>
                            )}
                            {!isColumnHidden("Quantité") && <td>{row.Quantité || "-"}</td>}
                            {!isColumnHidden("Prix") && <td>{row.Prix || "-"}</td>}
                            {!isColumnHidden("Quantité Disponible") && (
                                <td>{row["Quantité Disponible"] || "-"}</td>
                            )}
                            {!isColumnHidden("Date de Création") && (
                                <td>{row["Date de Création"] || "-"}</td>
                            )}
                            {!isColumnHidden("Date d'expiration") && (
                                <td>{row["Date d'expiration"] || "-"}</td>
                            )}
                            {!isColumnHidden("Créé par") && <td>{row["Créé par"] || "-"}</td>}
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
    );
}