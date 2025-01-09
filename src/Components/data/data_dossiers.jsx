import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/dossiers_data.css";
import { FaFolder, FaEdit, FaTrash } from "react-icons/fa";

export default function DisplayDossiersData({ data = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 7;

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

    return (
        <div className="dossiers-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th></th>
                    <th>Identifiant</th>
                    <th>Code-barres</th>
                    <th>Nom du dossie</th>
                    <th>Catégorie</th>
                    <th>Emplacement</th>
                    <th>Description</th>
                    <th>Permission</th>
                    <th>Créé le</th>
                    <th>Modifier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="14" className="text-center">
                            Aucun dossier disponible à afficher.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>
                                <div className="folder-icon">
                                    <FaFolder/>
                                </div>
                            </td>
                            <td>{row.Identifiant || "-"}</td>
                            <td>{row["Code-barres"] || "-"}</td>
                            <td>{row.Type || "-"}</td>
                            <td>{row.Quantité || "-"}</td>
                            <td>{row["Quantité disponible"] || "-"}</td>
                            <td>{row["Seuil d'alerte"] || "-"}</td>
                            <td>{row.Catégorie || "-"}</td>
                            <td>{row["Mots-clés"] || "-"}</td>
                            <td>{row.Emplacement || "-"}</td>
                            <td>{row.Description || "-"}</td>
                            <td>{row["Créé le"] || "-"}</td>
                            <td>
                                <button
                                    className="edit-button-folder"
                                    aria-label="Modifier"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaEdit/>
                                </button>
                            </td>
                            <td>
                                <button
                                    className="delete-button-folder"
                                    aria-label="Supprimer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaTrash/>
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
