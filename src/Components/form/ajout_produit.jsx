import { useReducer, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FaBoxOpen, FaPlus, FaTrash } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";
import { MoonLoader } from "react-spinners";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const predefinedFields = [
    "Sous Categorie",
    "Marque",
    "Modèle",
    "Famille",
    "Sous Famille",
    "Taille",
    "Couleur",
    "Poids",
    "Volume",
    "Dimensions"
];

const initialState = {
    reference: "",
    type: "",
    codeBarres: "",
    description: "",
    uniteType: "",
    prixVenteTTC: "",
    category: "",
    categories: [],
    customFields: [],
    formErrors: {},
    loading: true,
    error: null,
    isSubmitting: false,
    sousCategories: [],
    familles: [],
    sousFamilles: [],
    marques: [],
    modeles: [],
    selectedValues: {},
    typesProduit: [],
    unitesType: []
};

const apiService = {
    async fetchData(endpoint) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/`);
        if (!response.ok) throw new Error(`Impossible de récupérer: ${endpoint}`);
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
            throw new Error(errorData.message || "Erreur lors de l'enregistrement");
        }
        return await response.json();
    },
    async saveProduct(data) {
        const response = await fetch(`${API_BASE_URL}/produits/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || "Échec de l'enregistrement");
        }
        return responseData;
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
        case "SET_SELECTED_FIELD_VALUES":
            return {
                ...state,
                selectedValues: {
                    ...state.selectedValues,
                    [action.field]: action.value
                }
            };
        case "SET_FORM_ERRORS":
            return { ...state, formErrors: action.errors };
        case "SET_CATEGORIES":
            return { ...state, categories: action.categories, loading: false };
        case "SET_ERROR":
            return { ...state, error: action.error, loading: false };
        case "SET_LOADING":
            return { ...state, loading: action.loading };
        case "SET_SUBMITTING":
            return { ...state, isSubmitting: action.isSubmitting };
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { name: "", value: "" }]
            };
        case "DELETE_CUSTOM_FIELD":
            return {
                ...state,
                customFields: state.customFields.filter((_, i) => i !== action.index)
            };
        case "UPDATE_CUSTOM_FIELD":
            const newCustomFields = state.customFields.map((field, i) =>
                i === action.index ? { ...field, [action.key]: action.value } : field
            );

            if (action.key === "value") {
                const currentField = state.customFields[action.index];
                if (currentField.name === "Famille") {
                    newCustomFields.forEach((field, idx) => {
                        if (field.name === "Sous Famille") {
                            newCustomFields[idx] = { ...field, value: "" };
                        }
                    });
                } else if (currentField.name === "Marque") {
                    newCustomFields.forEach((field, idx) => {
                        if (field.name === "Modèle") {
                            newCustomFields[idx] = { ...field, value: "" };
                        }
                    });
                }
            }

            return {
                ...state,
                customFields: newCustomFields
            };
        case "SET_SOUS_CATEGORIES":
            return { ...state, sousCategories: action.sousCategories };
        case "SET_FAMILLES":
            return { ...state, familles: action.familles };
        case "SET_SOUS_FAMILLES":
            return { ...state, sousFamilles: action.sousFamilles };
        case "SET_MARQUES":
            return { ...state, marques: action.marques };
        case "SET_MODELES":
            return { ...state, modeles: action.modeles };
        case "SET_TYPES_PRODUIT":
            return { ...state, typesProduit: action.typesProduit };
        case "SET_UNITES_TYPE":
            return { ...state, unitesType: action.unitesType };
        case "RESET_FORM":
            return { ...initialState, categories: state.categories, loading: false };
        default:
            return state;
    }
};

export default function ProductForm({ show, onHide, productToEdit }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { refreshProducts } = useProductContext();

    const handleCategoryChange = async (value) => {
        dispatch({ type: "SET_FIELD", field: "category", value });
        dispatch({ type: "SET_SOUS_CATEGORIES", sousCategories: [] });
        try {
            const sousCategories = await apiService.fetchData(`categories/${parseInt(value)}/sous-categories`);
            dispatch({ type: "SET_SOUS_CATEGORIES", sousCategories });
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        }
    };

    const handleCustomFieldChange = async (index, key, value) => {
        dispatch({ type: "UPDATE_CUSTOM_FIELD", index, key, value });

        if (key === "value") {
            const field = state.customFields[index];

            switch (field.name) {
                case "Marque":
                    try {
                        const modeles = await apiService.fetchData(`marques/${value}/modeles`);
                        dispatch({ type: "SET_MODELES", modeles });
                    } catch (error) {
                        dispatch({ type: "SET_ERROR", error: error.message });
                    }
                    break;

                case "Famille":
                    try {
                        const sousFamilles = await apiService.fetchData(`familles/${value}/sous-familles`);
                        dispatch({ type: "SET_SOUS_FAMILLES", sousFamilles });
                    } catch (error) {
                        dispatch({ type: "SET_ERROR", error: error.message });
                    }
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        const loadDependentData = async () => {
            if (productToEdit?.champsPersonnalises) {
                const { sousCategorie, model, sousFamille } = productToEdit.champsPersonnalises;

                if (sousCategorie) {
                    const sousCategories = await apiService.fetchData(
                        `categories/${sousCategorie.categorie}/sous-categories`
                    );
                    dispatch({ type: "SET_SOUS_CATEGORIES", sousCategories });
                }

                if (model) {
                    const modeles = await apiService.fetchData(
                        `marques/${model.marque.idMarque}/modeles`
                    );
                    dispatch({ type: "SET_MODELES", modeles });
                }

                if (sousFamille) {
                    const sousFamilles = await apiService.fetchData(
                        `familles/${sousFamille.famille.idFamille}/sous-familles`
                    );
                    dispatch({ type: "SET_SOUS_FAMILLES", sousFamilles });
                }
            }
        };

        if (productToEdit) {
            loadDependentData();
        }
    }, [productToEdit]);

    useEffect(() => {
        const fetchInitialData = async () => {
            dispatch({ type: "SET_LOADING", loading: true });
            try {
                const [categories, familles, marques, sousFamilles, typesProduit, unitesType] = await Promise.all([
                    apiService.fetchData("categories"),
                    apiService.fetchData("familles"),
                    apiService.fetchData("marques"),
                    apiService.fetchData("sous-familles"),
                    apiService.fetchData("types-produit"),
                    apiService.fetchData("unites-type")
                ]);
                dispatch({ type: "SET_CATEGORIES", categories });
                dispatch({ type: "SET_FAMILLES", familles });
                dispatch({ type: "SET_MARQUES", marques });
                dispatch({ type: "SET_SOUS_FAMILLES", sousFamilles });
                dispatch({ type: "SET_TYPES_PRODUIT", typesProduit });
                dispatch({ type: "SET_UNITES_TYPE", unitesType });

                if (productToEdit) {
                    const fields = {
                        reference: productToEdit.reference,
                        type: productToEdit.type?.id || "",
                        codeBarres: productToEdit.codeBarres,
                        description: productToEdit.description,
                        uniteType: productToEdit.uniteType?.id || "",
                        prixVenteTTC: productToEdit.prixVenteTTC,
                        category: productToEdit.categorie?.idCategorie || ""
                    };

                    if (productToEdit.champsPersonnalises) {
                        const customFields = [];
                        const selectedValues = {};

                        if (productToEdit.champsPersonnalises.sousCategorie) {
                            customFields.push({
                                name: "Sous Categorie",
                                value: productToEdit.champsPersonnalises.sousCategorie.idSousCategorie.toString()
                            });
                            selectedValues[`parentCategorie-${customFields.length - 1}`] =
                                productToEdit.champsPersonnalises.sousCategorie.categorie.toString();
                        }

                        if (productToEdit.champsPersonnalises.marque) {
                            customFields.push({
                                name: "Marque",
                                value: productToEdit.champsPersonnalises.marque.idMarque.toString()
                            });
                        }

                        if (productToEdit.champsPersonnalises.model) {
                            customFields.push({
                                name: "Modèle",
                                value: productToEdit.champsPersonnalises.model.idModel.toString()
                            });
                            selectedValues[`parentMarque-${customFields.length - 1}`] =
                                productToEdit.champsPersonnalises.model.marque.idMarque.toString();
                        }

                        if (productToEdit.champsPersonnalises.famille) {
                            customFields.push({
                                name: "Famille",
                                value: productToEdit.champsPersonnalises.famille.idFamille.toString()
                            });
                        }

                        if (productToEdit.champsPersonnalises.sousFamille) {
                            customFields.push({
                                name: "Sous Famille",
                                value: productToEdit.champsPersonnalises.sousFamille.idSousFamille.toString()
                            });
                            selectedValues[`parentFamille-${customFields.length - 1}`] =
                                productToEdit.champsPersonnalises.sousFamille.famille.idFamille.toString();
                        }

                        ["taille", "couleur", "poids", "volume", "dimensions"].forEach(field => {
                            if (productToEdit.champsPersonnalises[field]) {
                                customFields.push({
                                    name: field.charAt(0).toUpperCase() + field.slice(1),
                                    value: productToEdit.champsPersonnalises[field]
                                });
                            }
                        });

                        fields.customFields = customFields;
                        Object.entries(selectedValues).forEach(([key, value]) => {
                            dispatch({
                                type: "SET_SELECTED_FIELD_VALUES",
                                field: key,
                                value
                            });
                        });
                    }

                    Object.entries(fields).forEach(([key, value]) =>
                        dispatch({ type: "SET_FIELD", field: key, value })
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
        const requiredFields = ["reference", "type", "codeBarres", "description", "uniteType", "prixVenteTTC"];
        requiredFields.forEach((field) => {
            const val = state[field];
            if (!val || !String(val).trim()) {
                errors[field] = `Le champ ${field} est requis.`;
            }
        });
        if (!state.category) {
            errors.category = "La catégorie est requise.";
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
                const customFields = state.customFields.reduce((acc, field) => {
                    if (field.name && field.value) {
                        const fieldMapping = {
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
                        const apiKey = fieldMapping[field.name];
                        if (apiKey) {
                            if (["sousCategorie", "marque", "model", "famille", "sousFamille"].includes(apiKey)) {
                                acc[apiKey] = parseInt(field.value);
                            } else {
                                acc[apiKey] = field.value;
                            }
                        }
                    }
                    return acc;
                }, {});

                const formData = {
                    reference: state.reference,
                    type: state.type,
                    codeBarres: state.codeBarres,
                    description: state.description,
                    uniteType: state.uniteType,
                    prixVenteTTC: parseFloat(state.prixVenteTTC),
                    categorie: parseInt(state.category),
                    champsPersonnalises: customFields
                };

                if (productToEdit) {
                    await fetch(`${API_BASE_URL}/produits/${productToEdit.reference}/`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData)
                    });
                } else {
                    await apiService.saveProduct(formData);
                }

                dispatch({ type: "RESET_FORM" });
                refreshProducts();
                onHide();
            } catch (error) {
                dispatch({ type: "SET_ERROR", error: error.message });
            } finally {
                dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
            }
        }
    };

    const handleFieldChange = (field, value) => {
        const strValue = value !== undefined && value !== null ? String(value) : "";
        dispatch({
            type: "SET_FIELD",
            field,
            value,
            error: !strValue.trim() ? `Le champ ${field} est requis.` : undefined
        });
    };

    const renderCustomFieldInput = (field, index) => {
        switch (field.name) {
            case "Sous Categorie":
                return (
                    <Row>
                        <Col>
                            <Form.Select
                                value={state.selectedValues[`parentCategorie-${index}`] || ""}
                                onChange={async (e) => {
                                    const value = e.target.value;
                                    dispatch({
                                        type: "SET_SELECTED_FIELD_VALUES",
                                        field: `parentCategorie-${index}`,
                                        value
                                    });
                                    dispatch({ type: "SET_FIELD", field: "category", value });
                                    try {
                                        const sousCategories = await apiService.fetchData(`categories/${value}/sous-categories`);
                                        dispatch({ type: "SET_SOUS_CATEGORIES", sousCategories });
                                    } catch (error) {
                                        dispatch({ type: "SET_ERROR", error: error.message });
                                    }
                                }}
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {state.categories.map(category => (
                                    <option key={category.idCategorie} value={category.idCategorie}>
                                        {category.categorie}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select
                                value={field.value}
                                onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                                disabled={!state.selectedValues[`parentCategorie-${index}`]}
                            >
                                <option value="">Sélectionner une sous-catégorie</option>
                                {state.sousCategories.map(sousCategorie => (
                                    <option key={sousCategorie.idSousCategorie} value={sousCategorie.idSousCategorie}>
                                        {sousCategorie.sousCategorie}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                );

            case "Marque":
                return (
                    <Form.Select
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                    >
                        <option value="">Sélectionner une marque</option>
                        {state.marques.map(marque => (
                            <option key={marque.idMarque} value={marque.idMarque}>
                                {marque.marque}
                            </option>
                        ))}
                    </Form.Select>
                );

            case "Modèle":
                return (
                    <Row>
                        <Col>
                            <Form.Select
                                value={state.selectedValues[`parentMarque-${index}`] || ""}
                                onChange={async (e) => {
                                    const value = e.target.value;
                                    dispatch({
                                        type: "SET_SELECTED_FIELD_VALUES",
                                        field: `parentMarque-${index}`,
                                        value
                                    });
                                    try {
                                        const modeles = await apiService.fetchData(`marques/${value}/modeles`);
                                        dispatch({ type: "SET_MODELES", modeles });
                                    } catch (error) {
                                        dispatch({ type: "SET_ERROR", error: error.message });
                                    }
                                }}
                            >
                                <option value="">Sélectionner une marque</option>
                                {state.marques.map(marque => (
                                    <option key={marque.idMarque} value={marque.idMarque}>
                                        {marque.marque}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select
                                value={field.value}
                                onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                                disabled={!state.selectedValues[`parentMarque-${index}`]}
                            >
                                <option value="">Sélectionner un modèle</option>
                                {state.modeles.map(modele => (
                                    <option key={modele.idModel} value={modele.idModel}>
                                        {modele.model}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                );

            case "Famille":
                return (
                    <Form.Select
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                    >
                        <option value="">Sélectionner une famille</option>
                        {state.familles.map(famille => (
                            <option key={famille.idFamille} value={famille.idFamille}>
                                {famille.famille}
                            </option>
                        ))}
                    </Form.Select>
                );

            case "Sous Famille":
                return (
                    <Row>
                        <Col>
                            <Form.Select
                                value={state.selectedValues[`parentFamille-${index}`] || ""}
                                onChange={async (e) => {
                                    const value = e.target.value;
                                    dispatch({
                                        type: "SET_SELECTED_FIELD_VALUES",
                                        field: `parentFamille-${index}`,
                                        value
                                    });
                                    try {
                                        const sousFamilles = await apiService.fetchData(`familles/${value}/sous-familles`);
                                        dispatch({ type: "SET_SOUS_FAMILLES", sousFamilles });
                                    } catch (error) {
                                        dispatch({ type: "SET_ERROR", error: error.message });
                                    }
                                }}
                            >
                                <option value="">Sélectionner une famille</option>
                                {state.familles.map(famille => (
                                    <option key={famille.idFamille} value={famille.idFamille}>
                                        {famille.famille}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select
                                value={field.value}
                                onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                                disabled={!state.selectedValues[`parentFamille-${index}`]}
                            >
                                <option value="">Sélectionner une sous-famille</option>
                                {state.sousFamilles.map(sousFamille => (
                                    <option key={sousFamille.idSousFamille} value={sousFamille.idSousFamille}>
                                        {sousFamille.sousFamille}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                );

            default:
                return (
                    <Form.Control
                        placeholder="Valeur"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                    />
                );
        }
    };

    if (state.loading) {
        return <div style={{
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
        </div>;
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
                    <Alert
                        variant="danger"
                        dismissible
                        onClose={() => dispatch({ type: "SET_ERROR", error: null })}
                    >
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
                                    {state.typesProduit.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.nom}
                                        </option>
                                    ))}
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
                                <Form.Label>Type d'unité *</Form.Label>
                                <Form.Select
                                    value={state.uniteType}
                                    onChange={(e) => handleFieldChange("uniteType", e.target.value)}
                                    isInvalid={!!state.formErrors.uniteType}
                                >
                                    <option value="">Sélectionner une unité</option>
                                    {state.unitesType.map(unite => (
                                        <option key={unite.id} value={unite.id}>
                                            {unite.nom}
                                        </option>
                                    ))}
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
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Catégorie *</Form.Label>
                                <Form.Select
                                    value={state.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    isInvalid={!!state.formErrors.category}
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {state.categories.map((category) => (
                                        <option key={category.idCategorie} value={category.idCategorie}>
                                            {category.categorie}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.category}
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
                        <div className="custom-fields mt-4">
                            <h5>Champs personnalisés</h5>
                            {state.customFields.map((field, index) => (
                                <Row key={index} className="g-3 align-items-center mb-2">
                                    <Col md={4}>
                                        <Form.Select
                                            value={field.name}
                                            onChange={(e) => handleCustomFieldChange(index, "name", e.target.value)}
                                        >
                                            <option value="">Sélectionner un champ</option>
                                            {predefinedFields
                                                .filter(
                                                    f =>
                                                        f === field.name ||
                                                        !state.customFields.some(existing => existing.name === f && existing !== field)
                                                )
                                                .map((f, i) => (
                                                    <option key={i} value={f}>
                                                        {f}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={7}>
                                        {renderCustomFieldInput(field, index)}
                                    </Col>
                                    <Col md={1} className="d-flex align-items-center">
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
                            <Button type="submit" className="w-100" disabled={state.isSubmitting}>
                                {state.isSubmitting ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </div>
                    </Row>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}