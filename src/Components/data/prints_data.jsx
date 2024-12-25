import { useState } from "react";
import { Table } from "flowbite-react";
import "../../CSS/folders_data.css";
import {FaEdit, FaTrash} from "react-icons/fa";

export default function DisplayPrintsData({ data = [] }) {
    const [selectedPrint, setSelectedPrint] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 7;

    const handleRowClick = (print) => {
        setSelectedPrint(print);
    };

    const handleBack = () => {
        setSelectedPrint(null);
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

    if (selectedPrint) {
        return (
            <div className="selected-print-container">
                {/* Customize further handling for selected print if needed */}
                <button onClick={handleBack}>Retour</button>
            </div>
        );
    }

    return (
        <div className="prints-data-container">
            <Table hoverable={true} striped={true}>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>SKU</th>
                    <th>Print Tags</th>
                    <th>IPC*</th>
                    <th>Items</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center">
                            No data available to display.
                        </td>
                    </tr>
                ) : (
                    paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => handleRowClick(row)}>
                            <td>{row.Title || "-"}</td>
                            <td>{row.SKU || "-"}</td>
                            <td>{row["Print Tags"] || "-"}</td>
                            <td>{row["IPC*"] || "-"}</td>
                            <td>{row.Items || "-"}</td>
                            <td>
                                <button
                                    className="edit-button-folder"
                                    aria-label="Edit"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click
                                >
                                    <FaEdit />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="delete-button-folder"
                                    aria-label="Delete"
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
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
