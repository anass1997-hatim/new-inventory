import { useState } from "react";
import { Table } from "flowbite-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../../CSS/categories_data.css";

export default function DisplayCategoriesData({ folder, onBack }) {
    const categoriesData = [
        { category: "Catégorie 1", description: "Description 1" },
        { category: "Catégorie 2", description: "Description 2" },
        { category: "Catégorie 3", description: "Description 3" },
        { category: "Catégorie 4", description: "Description 4" },
        { category: "Catégorie 5", description: "Description 5" },
        { category: "Catégorie 6", description: "Description 6" },
        { category: "Catégorie 7", description: "Description 7" },
        { category: "Catégorie 8", description: "Description 8" },
        { category: "Catégorie 9", description: "Description 9" },
        { category: "Catégorie 10", description: "Description 10" },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const totalPages = Math.max(1, Math.ceil(categoriesData.length / rowsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const paginatedData = categoriesData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className="categories-container">
            <div className="header">
                <h3 className="title">Catégories liées à : {folder.Titre}</h3>
                <button className="back-button" onClick={onBack}>
                    Retour
                </button>
            </div>
            <Table hoverable={true} striped={true} className="categories-table">
                <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Description</th>
                    <th>Modifier</th>
                    <th>Supprimer</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center">
                            Aucune catégorie disponible.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((category, index) => (
                        <tr key={index}>
                            <td>{category.category}</td>
                            <td>{category.description}</td>
                            <td>
                                <button
                                    className="edit-button-folder"
                                    aria-label="Modifier catégorie"
                                >
                                    <FaEdit />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="delete-button-folder"
                                    aria-label="Supprimer catégorie"
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
