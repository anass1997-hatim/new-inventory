import { useState } from "react";
import ProductForm from "../form/ajout_produit";
import FolderForm from "../form/ajout_dossier";

export default function DataComponent({ show, onHide }) {
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);

    const switchToFolderForm = () => {
        setShowProductForm(false);
        setShowFolderForm(true);
    };

    const switchToProductForm = () => {
        setShowFolderForm(false);
        setShowProductForm(true);
    };
    const handleProductFormShow = (isVisible) => {
        setShowProductForm(isVisible);
        if (!isVisible && !showFolderForm) {
            onHide();
        }
    };

    const handleFolderFormShow = (isVisible) => {
        setShowFolderForm(isVisible);
        if (!isVisible && !showProductForm) {
            onHide();
        }
    };

    // Update local state when parent show prop changes
    if (show && !showProductForm && !showFolderForm) {
        setShowProductForm(true);
    }

    return (
        <>
            <ProductForm
                show={showProductForm}
                onHide={() => handleProductFormShow(false)}
                onSwitchToFolderForm={switchToFolderForm}
            />
            <FolderForm
                show={showFolderForm}
                onHide={() => handleFolderFormShow(false)}
                onSwitchToProductForm={switchToProductForm}
                isFromProductForm={true}
            />

        </>
    );
}