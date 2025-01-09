import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../../CSS/ConfirmationModal.css";

export default function ConfirmationModal({ show, onConfirm, onCancel, message, title }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton className="modal-header-styled">
                <Modal.Title>{title || "Confirmation"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-styled">
                {message || "Êtes-vous sûr de vouloir effectuer cette action ?"}
            </Modal.Body>
            <Modal.Footer className="modal-footer-styled">
                <Button variant="secondary" onClick={onCancel} className="btn-cancel">
                    Annuler
                </Button>
                <Button variant="danger" onClick={onConfirm} className="btn-confirm">
                    Confirmer
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
