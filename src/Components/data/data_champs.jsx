import { useState, useEffect } from "react";
import { Table } from "flowbite-react";
import { FaBox, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmationModal from "../modals/confirmation_delete_produit";
import { ToastContainer } from "react-toastify";
import {MoonLoader} from "react-spinners";

export default function DisplayChampsData() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [hoveredRow, setHoveredRow] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const rowsPerPage = 7;
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedChamp, setSelectedChamp] = useState(null);
    const API_BASE_URL = "http://127.0.0.1:8000/api";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/champs-personnalises/`);
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getSousCategorie = (champ) => {
        return champ.sousCategorie?.sousCategorie || "Non spécifiée";
    };

    const getMarque = (champ) => {
        return champ.marque?.marque || "Non spécifiée";
    };

    const getModel = (champ) => {
        return champ.model?.model || "Non spécifié";
    };

    const getFamille = (champ) => {
        return champ.famille?.famille || "Non spécifiée";
    };

    const getSousFamille = (champ) => {
        return champ.sousFamille?.sousFamille || "Non spécifiée";
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
            case "sousCategorie":
                return getSousCategorie(row);
            case "marque":
                return getMarque(row);
            case "model":
                return getModel(row);
            case "famille":
                return getFamille(row);
            case "sousFamille":
                return getSousFamille(row);
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

        if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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

    const handleDelete = (champ) => {
        setSelectedChamp(champ);
        setModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (selectedChamp) {
                const response = await fetch(`${API_BASE_URL}/champs-personnalises/${selectedChamp.idChampsPersonnalises}/`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) throw new Error("Échec de la suppression");

                setData(data.filter(item => item.idChampsPersonnalises !== selectedChamp.idChampsPersonnalises));
                toast.success("Champ personnalisé supprimé avec succès");
            }
        } catch (error) {
            toast.error(`Erreur: ${error.message}`);
        } finally {
            setModalVisible(false);
            setSelectedChamp(null);
        }
    };

    if (loading)  return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
        }}>
            <MoonLoader color="#105494" size={60} />
        </div>
    );
    if (error) return <div>Erreur: {error}</div>;

    return (
        <div className="folders-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th></th>
                    {!shouldHideColumn("sousCategorie") && (
                        <th onClick={() => handleSort("sousCategorie")}>
                            Sous-Catégorie {renderSortIcon("sousCategorie")}
                        </th>
                    )}
                    {!shouldHideColumn("marque") && (
                        <th onClick={() => handleSort("marque")}>
                            Marque {renderSortIcon("marque")}
                        </th>
                    )}
                    {!shouldHideColumn("model") && (
                        <th onClick={() => handleSort("model")}>
                            Modèle {renderSortIcon("model")}
                        </th>
                    )}
                    {!shouldHideColumn("famille") && (
                        <th onClick={() => handleSort("famille")}>
                            Famille {renderSortIcon("famille")}
                        </th>
                    )}
                    {!shouldHideColumn("sousFamille") && (
                        <th onClick={() => handleSort("sousFamille")}>
                            Sous-Famille {renderSortIcon("sousFamille")}
                        </th>
                    )}
                    <th onClick={() => handleSort("taille")}>
                        Taille {renderSortIcon("taille")}
                    </th>
                    <th onClick={() => handleSort("couleur")}>
                        Couleur {renderSortIcon("couleur")}
                    </th>
                    <th onClick={() => handleSort("poids")}>
                        Poids {renderSortIcon("poids")}
                    </th>
                    <th onClick={() => handleSort("volume")}>
                        Volume {renderSortIcon("volume")}
                    </th>
                    <th onClick={() => handleSort("dimensions")}>
                        Dimensions {renderSortIcon("dimensions")}
                    </th>
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
                    paginatedData.map((row) => (
                        <tr
                            key={row.idChampsPersonnalises}
                            onMouseEnter={() => setHoveredRow(row.idChampsPersonnalises)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="relative"
                        >
                            <td>
                                <div className="product-icon">
                                    <FaBox />
                                </div>
                            </td>
                            {!shouldHideColumn("sousCategorie") && <td>{getSousCategorie(row)}</td>}
                            {!shouldHideColumn("marque") && <td>{getMarque(row)}</td>}
                            {!shouldHideColumn("model") && <td>{getModel(row)}</td>}
                            {!shouldHideColumn("famille") && <td>{getFamille(row)}</td>}
                            {!shouldHideColumn("sousFamille") && <td>{getSousFamille(row)}</td>}
                            <td>{row.taille}</td>
                            <td>{row.couleur}</td>
                            <td>{row.poids}</td>
                            <td>{row.volume}</td>
                            <td>{row.dimensions}</td>
                            <td className="action-cell">
                                {hoveredRow === row.idChampsPersonnalises && (
                                    <div className="action-buttons">
                                        <button
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
                onCancel={() => setModalVisible(false)}
                productName={selectedChamp?.idChampsPersonnalises}
            />
            <ToastContainer />
        </div>
    );
}