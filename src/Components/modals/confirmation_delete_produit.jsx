import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../../CSS/ConfirmationModal.css";

export default function DeleteConfirmationModal({ show, onConfirm, onCancel, productName }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton className="modal-header-styled">
                <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-styled">
                Êtes-vous sûr de vouloir supprimer le produit <strong>{productName}</strong> ?
            </Modal.Body>
            <Modal.Footer className="modal-footer-styled">
                <Button variant="secondary" onClick={onCancel} className="btn-cancel">
                    Annuler
                </Button>
                <Button variant="danger" onClick={onConfirm} className="btn-confirm">
                    Supprimer
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
