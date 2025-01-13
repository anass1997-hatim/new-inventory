import React, { useState, useEffect } from "react";
import { Offcanvas, Form, Button } from "react-bootstrap";
import '../../CSS/associate.css'
const DossierAssociationPanel = ({
                                     show,
                                     onHide,
                                     dossierId,
                                     categories,
                                     onSave,
                                     associatedData,
                                 }) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [categorySearch, setCategorySearch] = useState("");
    const [subCategorySearch, setSubCategorySearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        if (associatedData) {
            setSelectedCategories(associatedData.categories || []);
            setSelectedSubCategories(associatedData.subCategories || []);
            setSelectedProducts(associatedData.products || []);
        }
    }, [associatedData]);

    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
            setSelectedSubCategories(
                selectedSubCategories.filter(
                    (sub) =>
                        !categories
                            .find((cat) => cat.id === categoryId)
                            .subCategories.map((subCat) => subCat.id)
                            .includes(sub.id)
                )
            );
            setSelectedProducts(
                selectedProducts.filter(
                    (prod) =>
                        !categories
                            .find((cat) => cat.id === categoryId)
                            .subCategories.flatMap((subCat) => subCat.products.map((p) => p.id))
                            .includes(prod.id)
                )
            );
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleSubCategoryChange = (subCategoryId, categoryId) => {
        if (selectedSubCategories.includes(subCategoryId)) {
            setSelectedSubCategories(
                selectedSubCategories.filter((id) => id !== subCategoryId)
            );
            setSelectedProducts(
                selectedProducts.filter(
                    (prod) =>
                        !categories
                            .find((cat) => cat.id === categoryId)
                            .subCategories.find((subCat) => subCat.id === subCategoryId)
                            .products.map((p) => p.id)
                            .includes(prod.id)
                )
            );
        } else {
            setSelectedSubCategories([...selectedSubCategories, subCategoryId]);
        }
    };

    const handleProductChange = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter((id) => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const saveAssociations = () => {
        onSave({
            dossierId,
            categories: selectedCategories,
            subCategories: selectedSubCategories,
            products: selectedProducts,
        });
        onHide();
    };

    const Section = ({ title, searchValue, onSearchChange, children }) => (
        <div className="association-dossiers-section">
            <div className="association-dossiers-section-header">
                <h3 className="association-dossiers-section-title">{title}</h3>
                <Form.Control
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="association-dossiers-search"
                />
            </div>
            <div className="association-dossiers-scrollable">{children}</div>
        </div>
    );

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="association-dossiers-modal">
            <Offcanvas.Header closeButton className="association-dossiers-header">
                <Offcanvas.Title className="association-dossiers-header-title">
                    Associate Dossier
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="association-dossiers-content">
                <div className="association-dossiers-sections">
                    <Section
                        title="Categories"
                        searchValue={categorySearch}
                        onSearchChange={setCategorySearch}
                    >
                        {categories
                            .filter((category) =>
                                category.name.toLowerCase().includes(categorySearch.toLowerCase())
                            )
                            .map((category) => (
                                <Form.Check
                                    key={category.id}
                                    type="checkbox"
                                    id={`category-${category.id}`}
                                    label={category.name}
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="category-checkbox"
                                />
                            ))}
                    </Section>

                    <Section
                        title="Subcategories"
                        searchValue={subCategorySearch}
                        onSearchChange={setSubCategorySearch}
                    >
                        {categories
                            .flatMap((category) =>
                                category.subCategories.filter((subCategory) =>
                                    subCategory.name
                                        .toLowerCase()
                                        .includes(subCategorySearch.toLowerCase())
                                )
                            )
                            .map((subCategory) => (
                                <Form.Check
                                    key={subCategory.id}
                                    type="checkbox"
                                    id={`subcategory-${subCategory.id}`}
                                    label={subCategory.name}
                                    checked={selectedSubCategories.includes(subCategory.id)}
                                    onChange={() =>
                                        handleSubCategoryChange(
                                            subCategory.id,
                                            subCategory.parentCategoryId
                                        )
                                    }
                                    className="subcategory-checkbox"
                                />
                            ))}
                    </Section>

                    <Section
                        title="Products"
                        searchValue={productSearch}
                        onSearchChange={setProductSearch}
                    >
                        {categories
                            .flatMap((category) =>
                                category.subCategories.flatMap((subCategory) =>
                                    subCategory.products.filter((product) =>
                                        product.name
                                            .toLowerCase()
                                            .includes(productSearch.toLowerCase())
                                    )
                                )
                            )
                            .map((product) => (
                                <Form.Check
                                    key={product.id}
                                    type="checkbox"
                                    id={`product-${product.id}`}
                                    label={product.name}
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => handleProductChange(product.id)}
                                    className="product-checkbox"
                                />
                            ))}
                    </Section>
                </div>

                <div className="association-dossiers-footer">
                    <div className="association-dossiers-buttons">
                        <Button
                            variant="secondary"
                            onClick={onHide}
                            className="association-dossiers-btn-secondary"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={saveAssociations}
                            className="association-dossiers-btn-primary"
                        >
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default DossierAssociationPanel;
