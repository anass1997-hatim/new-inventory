import { useReducer, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup, Alert } from "react-bootstrap";
import { FaBoxOpen, FaPlus, FaTrash } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const predefinedFields = [
    "Sous Categorie", "Marque", "Modèle", "Famille", "Sous Famille",
    "Taille", "Couleur", "Poids", "Volume", "Dimensions"
];


const initialState = {
    reference: "",
    type: "",
    codeBarres: "",
    description: "",
    uniteType: "",
    prixVenteTTC: "",
    category: "",
    depot: "",
    quantite: "",
    codeRFID: "",
    dateAffectation: "",
    datePeremption: "",
    categories: [],
    depots: [],
    newCategory: "",
    newDepot: "",
    customFields: [],
    formErrors: {},
    loading: true,
    error: null,
    isSubmitting: false
};

const apiService = {
    async fetchData(endpoint) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/`);
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        return await response.json();
    },

    async saveData(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to save ${endpoint}`);
        }
        return await response.json();
    },

    async saveProduct(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/produits/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to save product");
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return {
                ...state,
                [action.field]: action.value,
                formErrors: {
                    ...state.formErrors,
                    [action.field]: action.error
                }
            };
        case "SET_FORM_ERRORS":
            return { ...state, formErrors: action.errors };
        case "SET_CATEGORIES":
            return { ...state, categories: action.categories, loading: false };
        case "SET_DEPOTS":
            return { ...state, depots: action.depots, loading: false };
        case "SET_ERROR":
            return { ...state, error: action.error, loading: false };
        case "SET_LOADING":
            return { ...state, loading: action.loading };
        case "SET_SUBMITTING":
            return { ...state, isSubmitting: action.isSubmitting };
        case "ADD_CATEGORY":
            return {
                ...state,
                categories: [...state.categories, action.category],
                newCategory: ""
            };
        case "ADD_DEPOT":
            return {
                ...state,
                depots: [...state.depots, action.depot],
                newDepot: ""
            };
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { name: "", value: "" }]
            };
        case "DELETE_CUSTOM_FIELD":
            return {
                ...state,
                customFields: state.customFields.filter((_, index) => index !== action.index)
            };
        case "UPDATE_CUSTOM_FIELD":
            return {
                ...state,
                customFields: state.customFields.map((field, index) =>
                    index === action.index
                        ? { ...field, [action.key]: action.value }
                        : field
                )
            };
        case "RESET_FORM":
            return {
                ...initialState,
                categories: state.categories,
                depots: state.depots,
                loading: false
            };
        default:
            return state;
    }
};

export default function ProductForm({ show, onHide , productToEdit  }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { refreshProducts } = useProductContext();


    useEffect(() => {
        const fetchInitialData = async () => {
            dispatch({ type: "SET_LOADING", loading: true });
            try {
                const [categories, depots] = await Promise.all([
                    apiService.fetchData("categories"),
                    apiService.fetchData("depots"),
                ]);

                dispatch({ type: "SET_CATEGORIES", categories });
                dispatch({ type: "SET_DEPOTS", depots });

                if (productToEdit) {
                    const fields = {
                        reference: productToEdit.reference,
                        type: productToEdit.type,
                        codeBarres: productToEdit.codeBarres,
                        description: productToEdit.description,
                        uniteType: productToEdit.uniteType,
                        prixVenteTTC: productToEdit.prixVenteTTC,
                        category: productToEdit.categorie?.idCategorie || "",
                        depot: productToEdit.depot?.idDepot || "",
                        quantite: productToEdit.quantite,
                        codeRFID: productToEdit.codeRFID,
                        dateAffectation: productToEdit.dateAffectation || "",
                        datePeremption: productToEdit.datePeremption || "",
                    };

                    // Initialize custom fields only for non-null values
                    if (productToEdit.champsPersonnalises) {
                        const customFieldsMapping = {
                            "Sous Categorie": "sousCategorie",
                            "Marque": "marque",
                            "Modèle": "model",
                            "Famille": "famille",
                            "Sous Famille": "sousFamille",
                            "Taille": "taille",
                            "Couleur": "couleur",
                            "Poids": "poids",
                            "Volume": "volume",
                            "Dimensions": "dimensions"
                        };

                        const nonEmptyCustomFields = Object.entries(customFieldsMapping)
                            .filter(([_, apiKey]) => productToEdit.champsPersonnalises[apiKey] !== null)
                            .map(([displayName, apiKey]) => ({
                                name: displayName,
                                value: productToEdit.champsPersonnalises[apiKey]
                            }));

                        fields.customFields = nonEmptyCustomFields;
                    }

                    Object.keys(fields).forEach((key) =>
                        dispatch({ type: "SET_FIELD", field: key, value: fields[key] })
                    );
                }
            } catch (error) {
                dispatch({ type: "SET_ERROR", error: error.message });
            } finally {
                dispatch({ type: "SET_LOADING", loading: false });
            }
        };

        fetchInitialData();
    }, [productToEdit]);






    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            "reference", "type", "codeBarres", "description", "uniteType",
            "prixVenteTTC", "quantite", "codeRFID"
        ];

        requiredFields.forEach(field => {
            if (!state[field]?.toString().trim()) {
                errors[field] = `Le champ ${field} est requis.`;
            }
        });
        if (!state.category) {
            errors.category = "La catégorie est requise.";
        }

        if (!state.depot) {
            errors.depot = "Le dépôt est requis.";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        dispatch({ type: "SET_FORM_ERRORS", errors });

        if (Object.keys(errors).length === 0) {
            dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

            try {
                const selectedCategory = state.categories.find(
                    (cat) => cat.idCategorie === parseInt(state.category)
                );
                const selectedDepot = state.depots.find(
                    (dep) => dep.idDepot === parseInt(state.depot)
                );

                const formData = {
                    reference: state.reference,
                    type: state.type,
                    codeBarres: state.codeBarres,
                    description: state.description,
                    uniteType: state.uniteType,
                    prixVenteTTC: parseFloat(state.prixVenteTTC),
                    categorie: selectedCategory ? {
                        idCategorie: selectedCategory.idCategorie,
                        categorie: selectedCategory.categorie
                    } : null,
                    depot: selectedDepot ? {
                        idDepot: selectedDepot.idDepot,
                        depot: selectedDepot.depot
                    } : null,
                    champsPersonnalises: state.customFields.length > 0 ? {
                        sousCategorie: state.customFields.find(f => f.name === "Sous Categorie")?.value || null,
                        marque: state.customFields.find(f => f.name === "Marque")?.value || null,
                        model: state.customFields.find(f => f.name === "Modèle")?.value || null,
                        famille: state.customFields.find(f => f.name === "Famille")?.value || null,
                        sousFamille: state.customFields.find(f => f.name === "Sous Famille")?.value || null,
                        taille: state.customFields.find(f => f.name === "Taille")?.value || null,
                        couleur: state.customFields.find(f => f.name === "Couleur")?.value || null,
                        poids: state.customFields.find(f => f.name === "Poids")?.value || null,
                        volume: state.customFields.find(f => f.name === "Volume")?.value || null,
                        dimensions: state.customFields.find(f => f.name === "Dimensions")?.value || null
                    } : null,
                    quantite: parseInt(state.quantite),
                    codeRFID: state.codeRFID,
                    dateAffectation: state.dateAffectation || null,
                    datePeremption: state.datePeremption || null,
                };

                if (productToEdit) {
                    await fetch(`${API_BASE_URL}/produits/${productToEdit.reference}/`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    await apiService.saveProduct(formData);
                }

                dispatch({ type: "RESET_FORM" });
                refreshProducts();
                onHide();

            } catch (error) {
                console.error("Submission error:", error);
                dispatch({ type: "SET_ERROR", error: error.message });
            } finally {
                dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
            }
        }
    };


    const handleFieldChange = (field, value) => {
        dispatch({
            type: "SET_FIELD",
            field,
            value,
            error: !value.toString().trim() ? `Le champ ${field} est requis.` : undefined
        });
    };

    const handleAddCategory = async () => {
        if (!state.newCategory.trim()) return;

        try {
            const newCategory = await apiService.saveData("categories", {
                categorie: state.newCategory.trim()
            });
            if (!state.categories.some(cat => cat.idCategorie === newCategory.idCategorie)) {
                dispatch({ type: "SET_CATEGORIES",
                    categories: [...state.categories, newCategory]
                });
            }
            handleFieldChange("category", newCategory.idCategorie.toString());
            dispatch({ type: "SET_FIELD", field: "newCategory", value: "" });
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        }
    };

    const handleAddDepot = async () => {
        if (!state.newDepot.trim()) return;

        try {
            const newDepot = await apiService.saveData("depots", {
                depot: state.newDepot.trim()
            });
            if (!state.depots.some(dep => dep.idDepot === newDepot.idDepot)) {
                dispatch({ type: "SET_DEPOTS",
                    depots: [...state.depots, newDepot]
                });
            }
            handleFieldChange("depot", newDepot.idDepot.toString());
            dispatch({ type: "SET_FIELD", field: "newDepot", value: "" });
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        }
    };
    if (state.loading) {
        return <p>chargement...</p>;
    }


    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="h4 d-flex align-items-center">
                    <FaBoxOpen className="me-2" />
                    {productToEdit ? "Modifier le produit" : "Ajouter un produit"}
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {state.error && (
                    <Alert variant="danger" dismissible onClose={() => dispatch({ type: "SET_ERROR", error: null })}>
                        {state.error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Référence *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.reference}
                                    onChange={(e) => handleFieldChange("reference", e.target.value)}
                                    isInvalid={!!state.formErrors.reference}
                                    disabled={!!productToEdit}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.reference}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Type *</Form.Label>
                                <Form.Select
                                    value={state.type}
                                    onChange={(e) => handleFieldChange("type", e.target.value)}
                                    isInvalid={!!state.formErrors.type}
                                >
                                    <option value="">Sélectionner un type</option>
                                    <option value="Revente">Revente</option>
                                    <option value="Immobilisation">Immobilisation</option>
                                    <option value="Equipement">Equipement</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.type}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Code Barres *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.codeBarres}
                                    onChange={(e) => handleFieldChange("codeBarres", e.target.value)}
                                    isInvalid={!!state.formErrors.codeBarres}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.codeBarres}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Unité Type *</Form.Label>
                                <Form.Select
                                    value={state.uniteType}
                                    onChange={(e) => handleFieldChange("uniteType", e.target.value)}
                                    isInvalid={!!state.formErrors.uniteType}
                                >
                                    <option value="">Sélectionner une unité</option>
                                    <option value="Pièce">Pièce</option>
                                    <option value="Douzaine">Douzaine</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.uniteType}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Prix Vente TTC *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={state.prixVenteTTC}
                                    onChange={(e) => handleFieldChange("prixVenteTTC", e.target.value)}
                                    isInvalid={!!state.formErrors.prixVenteTTC}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.prixVenteTTC}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Form.Group>
                            <Form.Label>Description *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={state.description}
                                onChange={(e) => handleFieldChange("description", e.target.value)}
                                isInvalid={!!state.formErrors.description}
                                style={{ resize: "none" }}
                            />
                            <Form.Control.Feedback type="invalid">
                                {state.formErrors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Catégorie *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        value={state.category}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange("category", value);
                                        }}
                                        isInvalid={!!state.formErrors.category}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {state.categories.map((category) => (
                                            <option key={category.idCategorie} value={category.idCategorie}>
                                                {category.categorie}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouvelle catégorie"
                                        value={state.newCategory}
                                        onChange={(e) => handleFieldChange("newCategory", e.target.value)}
                                    />
                                    <Button
                                        variant="outline-primary"
                                        onClick={handleAddCategory}
                                        disabled={!state.newCategory.trim()}
                                    >
                                        <FaPlus />
                                    </Button>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.category}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Dépôt *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        value={state.depot}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleFieldChange("depot", value);
                                        }}
                                        isInvalid={!!state.formErrors.depot}
                                    >
                                        <option value="">Sélectionner un dépôt</option>
                                        {state.depots.map((depot) => (
                                            <option key={depot.idDepot} value={depot.idDepot}>
                                                {depot.depot}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouveau dépôt"
                                        value={state.newDepot}
                                        onChange={(e) => handleFieldChange("newDepot", e.target.value)}
                                    />
                                    <Button
                                        variant="outline-primary"
                                        onClick={handleAddDepot}
                                        disabled={!state.newDepot.trim()}
                                    >
                                        <FaPlus />
                                    </Button>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.depot}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Quantité *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={state.quantite}
                                    onChange={(e) => handleFieldChange("quantite", e.target.value)}
                                    isInvalid={!!state.formErrors.quantite}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.quantite}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Code RFID *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.codeRFID}
                                    onChange={(e) => handleFieldChange("codeRFID", e.target.value)}
                                    isInvalid={!!state.formErrors.codeRFID}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.codeRFID}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Date Affectation</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={state.dateAffectation}
                                    onChange={(e) => handleFieldChange("dateAffectation", e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Date Péremption</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={state.datePeremption}
                                    onChange={(e) => handleFieldChange("datePeremption", e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <div className="custom-fields mt-4">
                            <h5>Champs personnalisés</h5>
                            {state.customFields.map((field, index) => (
                                <Row key={index} className="g-3 align-items-center mb-2">
                                    <Col md={5}>
                                        <Form.Select
                                            value={field.name}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "UPDATE_CUSTOM_FIELD",
                                                    index,
                                                    key: "name",
                                                    value: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Sélectionner un champ</option>
                                            {predefinedFields
                                                .filter(f =>
                                                    f === field.name ||
                                                    !state.customFields.some(existingField =>
                                                        existingField.name === f && existingField !== field
                                                    )
                                                )
                                                .map((f, i) => (
                                                    <option key={i} value={f}>
                                                        {f}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Control
                                            placeholder="Valeur"
                                            value={field.value}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "UPDATE_CUSTOM_FIELD",
                                                    index,
                                                    key: "value",
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => dispatch({ type: "DELETE_CUSTOM_FIELD", index })}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            {state.customFields.length < predefinedFields.length && (
                                <Button
                                    variant="outline-primary"
                                    className="mt-2"
                                    onClick={() => dispatch({ type: "ADD_CUSTOM_FIELD" })}
                                >
                                    <FaPlus /> Ajouter un champ
                                </Button>
                            )}
                        </div>

                        <div className="d-grid gap-2 mt-4">
                            <Button
                                type="submit"
                                className="w-100"
                                disabled={state.isSubmitting}
                            >
                                {state.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </Row>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}