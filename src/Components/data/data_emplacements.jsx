import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/produits_data.css";
import { FaMapMarkerAlt, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function DisplayEmplacementsData({ data = [], hiddenColumns = [] }) {
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

        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

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
                    {!isColumnHidden("id") && (
                        <th onClick={() => handleSort("id")}>
                            ID {renderSortIcon("id")}
                        </th>
                    )}
                    {!isColumnHidden("emplacement") && (
                        <th onClick={() => handleSort("emplacement")}>
                            Emplacement {renderSortIcon("emplacement")}
                        </th>
                    )}
                    <th>Modifier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center">
                            Aucune donnée disponible à afficher.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>
                                <div className="emplacement-icon">
                                    <FaMapMarkerAlt />
                                </div>
                            </td>
                            {!isColumnHidden("id") && <td>{row.id || "-"}</td>}
                            {!isColumnHidden("emplacement") && <td>{row.emplacement || "-"}</td>}
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