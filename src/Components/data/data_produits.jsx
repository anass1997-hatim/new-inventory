import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/produits_data.css";
import { FaBox, FaEdit, FaTrash } from "react-icons/fa";

export default function DisplayProduitsData({ data = [] }) {

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
        <div className="folders-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th></th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                    <th>Quantité Disponible</th>
                    <th>Date de Création</th>
                    <th>Date d'expiration</th>
                    <th>Créé par</th>
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
                        <tr>
                            <td>
                                <div className="product-icon">
                                    <FaBox />
                                </div>
                            </td>
                            <td>
                                {row.Titre || "-"} | {row["Code-barres"] || "-"} | {row.Catégorie || "-"}
                            </td>
                            <td>{row.Quantité || "-"}</td>
                            <td>{row.Prix || "-"}</td>
                            <td>{row["Quantité Disponible"] || "-"}</td>
                            <td>{row["Date de Création"] || "-"}</td>
                            <td>{row["Date d'expiration"] || "-"}</td>
                            <td>{row["Créé par"] || "-"}</td>
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
