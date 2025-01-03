import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/folders_data.css";
import DisplayCategoriesData from "./categories_data";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function DisplayFoldersData({ data = [] }) {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 7;

    const handleRowClick = (folder) => {
        setSelectedFolder(folder);
    };

    const handleBack = () => {
        setSelectedFolder(null);
    };

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const paginatedData = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    if (selectedFolder) {
        return <DisplayCategoriesData folder={selectedFolder} onBack={handleBack} />;
    }

    return (
        <div className="folders-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th>Image</th>
                    <th>Identifiant</th>
                    <th>Type</th>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Code-barres</th>
                    <th>Emplacement</th>
                    <th>Mots-clés</th>
                    <th>Date de création</th>
                    <th>Modifier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="11" className="text-center">
                            Aucune donnée disponible à afficher.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => handleRowClick(row)}>
                            <td>
                                {row.Image ? (
                                    <img
                                        src={row.Image}
                                        alt="Folder"
                                        className="folder-image"
                                    />
                                ) : (
                                    <div className="placeholder-image">-</div>
                                )}
                            </td>
                            <td>{row.Identifiant || "-"}</td>
                            <td>{row.Type || "-"}</td>
                            <td>{row.Titre || "-"}</td>
                            <td>{row.Catégorie || "-"}</td>
                            <td>{row["Code-barres"] || "-"}</td>
                            <td>{row.Emplacement || "-"}</td>
                            <td>{row["Mots-clés"] || "-"}</td>
                            <td>{row["Date de création"] || "-"}</td>
                            <td>
                                <button
                                    className="edit-button-folder"
                                    aria-label="Modifier"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click
                                >
                                    <FaEdit />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="delete-button-folder"
                                    aria-label="Supprimer"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click
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
