import { useState } from "react";
import { Table } from "flowbite-react";
import { FaBox, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmationModal from "../modals/confirmation_delete_produit";
import { ToastContainer } from "react-toastify";
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

    const getProduitCombined = (row) => {
        const categorieName = row.categorie?.categorie || "Non spécifiée";
        return `${row.reference} | ${row.codeBarres} | ${categorieName}`;
    };

    const getTypeUniteCombined = (row) => {
        return `${row.type} | ${row.uniteType}`;
    };

    const getSousCategorieCouleur = (champs) => {
        if (!champs) return "Non spécifié";
        return `${champs.sousCategorie?.sousCategorie || "Non spécifiée"} | ${champs.couleur || "Non spécifiée"}`;
    };

    const getFamilleSousFamille = (champs) => {
        if (!champs) return "Non spécifié";
        return `${champs.famille?.famille || "Non spécifiée"} | ${champs.sousFamille?.sousFamille || "Non spécifiée"}`;
    };

    const getMarqueModele = (champs) => {
        if (!champs) return "Non spécifié";
        return `${champs.marque?.marque || "Non spécifiée"} | ${champs.model?.model || "Non spécifié"}`;
    };

    const getTailleDimensions = (champs) => {
        if (!champs) return "Non spécifié";
        return `${champs.taille || "Non spécifiée"} | ${champs.dimensions || "Non spécifiées"}`;
    };

    const getPoidsVolume = (champs) => {
        if (!champs) return "Non spécifié";
        return `${champs.poids || "Non spécifié"} | ${champs.volume || "Non spécifié"}`;
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
            case "TypeUnite":
                return getTypeUniteCombined(row);
            case "description":
                return row.description;
            case "SousCategorieCouleur":
                return getSousCategorieCouleur(row.champsPersonnalises);
            case "FamilleSousFamille":
                return getFamilleSousFamille(row.champsPersonnalises);
            case "MarqueModele":
                return getMarqueModele(row.champsPersonnalises);
            case "TailleDimensions":
                return getTailleDimensions(row.champsPersonnalises);
            case "PoidsVolume":
                return getPoidsVolume(row.champsPersonnalises);
            default:
                return row[key];
        }
    };

    const shouldHideColumn = (columnKey) => {
        return data.every(row => {
            const value = getValueForSort(row, columnKey);
            return value === "Non spécifié" || value === "Non spécifiée";
        });
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
                    {!shouldHideColumn("Produit") && (
                        <th onClick={() => handleSort("Produit")}>
                            Produit {renderSortIcon("Produit")}
                        </th>
                    )}
                    {!shouldHideColumn("TypeUnite") && (
                        <th onClick={() => handleSort("TypeUnite")}>
                            Type | Unité Type {renderSortIcon("TypeUnite")}
                        </th>
                    )}
                    {!shouldHideColumn("description") && (
                        <th onClick={() => handleSort("description")}>
                            Description {renderSortIcon("description")}
                        </th>
                    )}
                    {!shouldHideColumn("SousCategorieCouleur") && (
                        <th onClick={() => handleSort("SousCategorieCouleur")}>
                            Sous-Catégorie | Couleur {renderSortIcon("SousCategorieCouleur")}
                        </th>
                    )}
                    {!shouldHideColumn("FamilleSousFamille") && (
                        <th onClick={() => handleSort("FamilleSousFamille")}>
                            Famille | Sous-Famille {renderSortIcon("FamilleSousFamille")}
                        </th>
                    )}
                    {!shouldHideColumn("MarqueModele") && (
                        <th onClick={() => handleSort("MarqueModele")}>
                            Marque | Modèle {renderSortIcon("MarqueModele")}
                        </th>
                    )}
                    {!shouldHideColumn("TailleDimensions") && (
                        <th onClick={() => handleSort("TailleDimensions")}>
                            Taille | Dimensions {renderSortIcon("TailleDimensions")}
                        </th>
                    )}
                    {!shouldHideColumn("PoidsVolume") && (
                        <th onClick={() => handleSort("PoidsVolume")}>
                            Poids | Volume {renderSortIcon("PoidsVolume")}
                        </th>
                    )}
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="9" className="text-center">
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
                            {!shouldHideColumn("Produit") && <td>{getProduitCombined(row)}</td>}
                            {!shouldHideColumn("TypeUnite") && <td>{getTypeUniteCombined(row)}</td>}
                            {!shouldHideColumn("description") && <td>{row.description}</td>}
                            {!shouldHideColumn("SousCategorieCouleur") && <td>{getSousCategorieCouleur(row.champsPersonnalises)}</td>}
                            {!shouldHideColumn("FamilleSousFamille") && <td>{getFamilleSousFamille(row.champsPersonnalises)}</td>}
                            {!shouldHideColumn("MarqueModele") && <td>{getMarqueModele(row.champsPersonnalises)}</td>}
                            {!shouldHideColumn("TailleDimensions") && <td>{getTailleDimensions(row.champsPersonnalises)}</td>}
                            {!shouldHideColumn("PoidsVolume") && <td>{getPoidsVolume(row.champsPersonnalises)}</td>}
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