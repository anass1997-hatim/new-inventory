import { useState } from "react";
import { Table } from "flowbite-react";
import { FaBox, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmationModal from "../modals/confirmation_delete_produit";
import {ToastContainer} from "react-toastify";
import ProductForm from "../form/ajout_produit";

export default function DisplayProduitsData() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [hoveredRow, setHoveredRow] = useState(null);
    const rowsPerPage = 7;
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const API_BASE_URL = "http://127.0.0.1:8000/api";
    const { refreshProducts } = useProductContext();
    const { products: data, loading, error } = useProductContext();
    const apiService = {
        async deleteProduct(reference) {
            try {
                const response = await fetch(`${API_BASE_URL}/produits/${reference}/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete product");
                }

                return true;
            } catch (error) {
                console.error('Delete Error:', error);
                throw error;
            }
        },
    };

    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    const getProduitCombined = (row) => {
        const categorieName = row.categorie?.categorie || "Non spécifiée";
        return `${row.reference} | ${row.codeBarres} | ${categorieName}`;
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const getValueForSort = (row, key) => {
        switch (key) {
            case "Produit":
                return getProduitCombined(row);
            case "depot":
                return row.depot?.depot;
            case "prixVenteTTC":
            case "quantite":
                return Number(row[key]);
            case "dateAffectation":
            case "datePeremption":
                return new Date(row[key] || '');
            default:
                return row[key];
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = getValueForSort(a, sortConfig.key);
        const bValue = getValueForSort(b, sortConfig.key);

        if (!aValue) return sortConfig.direction === "asc" ? 1 : -1;
        if (!bValue) return sortConfig.direction === "asc" ? -1 : 1;

        if (aValue instanceof Date && !isNaN(aValue)) {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const paginatedData = sortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const renderSortIcon = (column) => {
        if (sortConfig.key !== column) return <FaSort className="sort-icon" />;
        return sortConfig.direction === "asc" ? (
            <FaSortUp className="sort-icon" />
        ) : (
            <FaSortDown className="sort-icon" />
        );
    };

    const handleEdit = (row) => {
        setProductToEdit(row);
        setEditModalVisible(true);
    };

    const handleDelete = (row) => {
        setSelectedProduct(row);
        setModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectedProduct) {
                const success = await apiService.deleteProduct(selectedProduct.reference);
                if (success) {
                    toast.success(`Le produit "${selectedProduct.reference}" a été supprimé avec succès.`);
                    refreshProducts();
                }
            }
        } catch (error) {
            toast.error(`Une erreur s'est produite lors de la suppression du produit "${selectedProduct.reference}".`);
        } finally {
            setModalVisible(false);
            setSelectedProduct(null);
        }
    };


    const handleDeleteCancel = () => {
        setModalVisible(false);
        setSelectedProduct(null);
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;

    return (
        <div className="folders-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th></th>
                    <th onClick={() => handleSort("Produit")}>
                        Produit {renderSortIcon("Produit")}
                    </th>
                    <th onClick={() => handleSort("type")}>
                        Type {renderSortIcon("type")}
                    </th>
                    <th onClick={() => handleSort("uniteType")}>
                        Unité Type {renderSortIcon("uniteType")}
                    </th>
                    <th onClick={() => handleSort("prixVenteTTC")}>
                        PrixVenteTTC {renderSortIcon("prixVenteTTC")}
                    </th>
                    <th onClick={() => handleSort("description")}>
                        Description {renderSortIcon("description")}
                    </th>
                    <th onClick={() => handleSort("quantite")}>
                        Quantité {renderSortIcon("quantite")}
                    </th>
                    <th onClick={() => handleSort("codeRFID")}>
                        CodeRFID {renderSortIcon("codeRFID")}
                    </th>
                    <th onClick={() => handleSort("depot")}>
                        Dépôt {renderSortIcon("depot")}
                    </th>
                    <th onClick={() => handleSort("dateAffectation")}>
                        DateAffectation {renderSortIcon("dateAffectation")}
                    </th>
                    <th onClick={() => handleSort("datePeremption")}>
                        DatePéremption {renderSortIcon("datePeremption")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="13" className="text-center">
                            Aucune donnée disponible à afficher.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row) => (
                        <tr
                            key={row.reference}
                            onMouseEnter={() => setHoveredRow(row.reference)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="relative"
                        >
                            <td>
                                <div className="product-icon">
                                    <FaBox />
                                </div>
                            </td>
                            <td>{getProduitCombined(row)}</td>
                            <td>{row.type}</td>
                            <td>{row.uniteType}</td>
                            <td>{row.prixVenteTTC?.toFixed(2)}</td>
                            <td  className="truncate-text">{row.description}</td>
                            <td>{row.quantite}</td>
                            <td>{row.codeRFID}</td>
                            <td className="truncate-text">{row.depot?.depot || "Non spécifié"}</td>
                            <td>{formatDate(row.dateAffectation)}</td>
                            <td>{formatDate(row.datePeremption)}</td>
                            <td className="action-cell">
                                {hoveredRow === row.reference && (
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="edit-button-folder"
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row)}
                                            className="delete-button-folder"
                                            title="Supprimer"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
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
            <DeleteConfirmationModal
                show={isModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                productName={selectedProduct?.reference}
            />
            <ToastContainer />
            <ProductForm
                show={isEditModalVisible}
                onHide={() => {
                    setEditModalVisible(false);
                    setProductToEdit(null);
                }}
                productToEdit={productToEdit}
            />

        </div>

    );
}