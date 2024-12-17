import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { FaCamera, FaPlus, FaTrash } from "react-icons/fa";
import { useState } from "react";
import "../../CSS/add_product.css";

export default function ProductForm({ show, onHide, placement }) {
    const [formData, setFormData] = useState({
        image: null,
        identifiant: "",
        barcode: "",
        location: "",
        category: "",
        keywords: "",
        description: "",
        customFields: [],
    });

    const [categories, setCategories] = useState(["Catégorie 1", "Catégorie 2"]);
    const [newCategory, setNewCategory] = useState("");

    const [keywords, setKeywords] = useState(["Mot-clé 1", "Mot-clé 2"]);
    const [newKeyword, setNewKeyword] = useState("");

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleAddCategory = () => {
        if (newCategory.trim() !== "") {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory("");
        }
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim() !== "") {
            setKeywords([...keywords, newKeyword.trim()]);
            setNewKeyword("");
        }
    };

    const handleAddCustomField = () => {
        setFormData((prev) => ({
            ...prev,
            customFields: [...prev.customFields, { name: "", value: "" }],
        }));
    };

    const handleDeleteCustomField = (index) => {
        const updatedFields = formData.customFields.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, customFields: updatedFields }));
    };

    const handleCustomFieldChange = (index, key, value) => {
        const updatedFields = [...formData.customFields];
        updatedFields[index][key] = value;
        setFormData((prev) => ({ ...prev, customFields: updatedFields }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement={placement} className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Ajouter un dossier</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="image">
                        <Form.Label>Image</Form.Label>
                        <div className="file-input-wrapper">
                            <label htmlFor="fileInput" className="file-input-icon">
                                <FaCamera />
                            </label>
                            <Form.Control
                                id="fileInput"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                style={{ display: "none" }}
                            />
                        </div>
                    </Form.Group>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="identifiant">
                                <Form.Label>Identifiant *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="identifiant"
                                    placeholder="Entrer l'identifiant"
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="barcode">
                                <Form.Label>Code-barres</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="barcode"
                                    placeholder="Entrer le code-barres"
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                            <Form.Group controlId="category">
                                <Form.Label>Catégorie</Form.Label>
                                <InputGroup>
                                    <Form.Select name="category" onChange={handleChange} className="category-select-folder">
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouvelle catégorie"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <Button variant="outline-primary" onClick={handleAddCategory}>
                                        <FaPlus />
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group controlId="keywords">
                                <Form.Label>Mots-clés</Form.Label>
                                <InputGroup>
                                    <Form.Select name="keywords" onChange={handleChange} className="category-select-folder">
                                        <option value="">Sélectionner un mot-clé</option>
                                        {keywords.map((word, index) => (
                                            <option key={index} value={word}>
                                                {word}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouveau mot-clé"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                    />
                                    <Button variant="outline-primary" onClick={handleAddKeyword}>
                                        <FaPlus />
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                        <Col md={6}>
                            <Form.Group controlId="location">
                                <Form.Label>Emplacement</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    placeholder="Entrer l'emplacement"
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>

                    </Row>

                    <div className="custom-fields mt-4">
                        <h5>Champs personnalisés</h5>
                        {formData.customFields.map((field, index) => (
                            <Row key={index} className="g-3 align-items-center" style={{ marginBottom: '10px' }}>
                                <Col md={5}>
                                    <Form.Control
                                        placeholder="Nom du champ"
                                        value={field.name}
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, "name", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={5}>
                                    <Form.Control
                                        placeholder="Valeur"
                                        value={field.value}
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, "value", e.target.value)
                                        }
                                    />
                                </Col>
                                <Col md={2} className="text-center">
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleDeleteCustomField(index)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        <Button
                            variant="outline-primary"
                            className="mt-2"
                            onClick={handleAddCustomField}
                        >
                            <FaPlus /> Ajouter un champ
                        </Button>
                    </div>

                    <Button variant="primary" type="submit" className="mt-4 w-100">
                        Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
