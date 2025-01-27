import { useReducer, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup, Alert } from "react-bootstrap";
import { FaFolderPlus, FaPlus, FaTrash } from "react-icons/fa";
import '../../CSS/ajout_produit.css';
import {MoonLoader} from "react-spinners";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const predefinedPermissions = ["Lecture", "Suppression", "Modification"];
const customFieldOptions = [
    { id: "etatProduit", label: "État du produit", type: "select", options: [
            { value: "Neuf", label: "Neuf" },
            { value: "Occasion", label: "Occasion" },
            { value: "Endommagé", label: "Endommagé" }
        ]},
    { id: "garantie", label: "Garantie", type: "text" },
    { id: "fournisseur", label: "Fournisseur", type: "text" },
    { id: "codeFournisseur", label: "Code fournisseur", type: "text" },
    { id: "statutDisponibilite", label: "Statut de disponibilité", type: "select", options: [
            { value: "Disponible", label: "Disponible" },
            { value: "Réservé", label: "Réservé" },
            { value: "Vendu", label: "Vendu" }
        ]},
    { id: "dateAchat", label: "Date d'achat", type: "date" }
];

const initialState = {
    identifiant: "",
    codebarres: "",
    nomDossier: "",
    description: "",
    permissions: [],
    customFields: [],
    categories: [],
    depots: [],
    newCategory: "",
    newDepot: "",
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
                    [action.field]: action.error || undefined,
                },
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
                newCategory: "",
            };
        case "ADD_DEPOT":
            return {
                ...state,
                depots: [...state.depots, action.depot],
                newDepot: "",
            };
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { fieldId: action.fieldId, value: "" }],
            };
        case "DELETE_CUSTOM_FIELD":
            return {
                ...state,
                customFields: state.customFields.filter((_, index) => index !== action.index),
            };
        case "UPDATE_CUSTOM_FIELD":
            const updatedFields = [...state.customFields];
            updatedFields[action.index].value = action.value;
            return { ...state, customFields: updatedFields };
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

export default function FolderForm({ show, onHide, onSwitchToProductForm, isFromProductForm }) {
    const [state, dispatch] = useReducer(reducer, initialState);

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
            } catch (error) {
                dispatch({ type: "SET_ERROR", error: error.message });
            } finally {
                dispatch({ type: "SET_LOADING", loading: false });
            }
        };

        fetchInitialData();
    }, []);

    const validateForm = () => {
        const errors = {};
        if (!state.identifiant.trim()) errors.identifiant = "L'identifiant est requis.";
        if (!state.codebarres.trim()) errors.codebarres = "Le code-barres est requis.";
        if (!state.permissions.length) errors.permissions = "Au moins une permission est requise.";
        if (!state.nomDossier?.trim()) errors.nomDossier = "Le nom du dossier est requis.";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        dispatch({ type: "SET_FORM_ERRORS", errors });

        if (Object.keys(errors).length === 0) {
            dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

            try {
                const formData = {
                    identifiant: state.identifiant,
                    codebarres: state.codebarres,
                    nomDossier: state.nomDossier,
                    description: state.description,
                    permissions: state.permissions,
                    customFields: state.customFields,
                    category: state.categories.find(cat => cat.idCategorie === parseInt(state.category)),
                    depot: state.depots.find(dep => dep.idDepot === parseInt(state.depot)),
                };

                await apiService.saveData("dossiers", formData);

                dispatch({ type: "RESET_FORM" });
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
        let error;
        if (field === "permissions") {
            error = value.length === 0 ? "Au moins une permission est requise." : undefined;
        } else {
            error = !value ? `${field} est requis.` : undefined;
        }

        dispatch({
            type: "SET_FIELD",
            field,
            value,
            error,
        });
    };

    const handlePermissionChange = (permission) => {
        const currentPermissions = [...state.permissions];
        const permissionIndex = currentPermissions.indexOf(permission);

        if (permissionIndex === -1) {
            currentPermissions.push(permission);
        } else {
            currentPermissions.splice(permissionIndex, 1);
        }

        handleFieldChange("permissions", currentPermissions);
    };

    const handleAddCategory = async () => {
        if (!state.newCategory.trim()) return;

        try {
            const newCategory = await apiService.saveData("categories", {
                categorie: state.newCategory.trim()
            });
            if (!state.categories.some(cat => cat.idCategorie === newCategory.idCategorie)) {
                dispatch({ type: "SET_CATEGORIES", categories: [...state.categories, newCategory] });
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
                dispatch({ type: "SET_DEPOTS", depots: [...state.depots, newDepot] });
            }
            handleFieldChange("depot", newDepot.idDepot.toString());
            dispatch({ type: "SET_FIELD", field: "newDepot", value: "" });
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        }
    };

    if (state.loading) {
        return (
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
        );;
    }

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <div className="d-flex flex-column w-100">
                    {isFromProductForm && (
                        <Button
                            variant="link"
                            onClick={onSwitchToProductForm}
                            className="p-0 text-decoration-none text-secondary align-self-start mb-2"
                        >
                            Retour au formulaire produit
                        </Button>
                    )}
                    <Offcanvas.Title className="h4 d-flex align-items-center">
                        <FaFolderPlus style={{ marginRight: "10px" }} />
                        Ajouter un Dossier
                    </Offcanvas.Title>
                </div>
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
                            <Form.Group className="mb-3">
                                <Form.Label>Refrence *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer la reférence"
                                    value={state.reference}
                                    onChange={(e) => handleFieldChange("reference", e.target.value)}
                                    isInvalid={!!state.formErrors.reference}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.identifiant}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Code Barres *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer le Code Barres"
                                    value={state.codebarres}
                                    onChange={(e) => handleFieldChange("codebarres", e.target.value)}
                                    isInvalid={!!state.formErrors.codebarres}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.codebarres}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom du Dossier *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer le nom du dossier"
                                    value={state.nomDossier}
                                    onChange={(e) => handleFieldChange("nomDossier", e.target.value)}
                                    isInvalid={!!state.formErrors.nomDossier}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.nomDossier}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Description *</Form.Label>
                                <Form.Control
                                    style={{resize : 'none'}}
                                    as="textarea"
                                    rows={3}
                                    placeholder="Entrer la description"
                                    value={state.description}
                                    onChange={(e) => handleFieldChange("description", e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Catégorie *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        value={state.category}
                                        onChange={(e) => handleFieldChange("category", e.target.value)}
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
                            <Form.Group className="mb-3">
                                <Form.Label>Dépôt *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        value={state.depot}
                                        onChange={(e) => handleFieldChange("depot", e.target.value)}
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
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Permissions *</Form.Label>
                                <div className="d-flex flex-column">
                                    {predefinedPermissions.map((permission, index) => (
                                        <Form.Check
                                            key={index}
                                            type="checkbox"
                                            id={`permission-${index}`}
                                            label={permission}
                                            checked={state.permissions.includes(permission)}
                                            onChange={() => handlePermissionChange(permission)}
                                            isInvalid={!!state.formErrors.permissions}
                                            className={state.formErrors.permissions ? "is-invalid" : ""}
                                        />
                                    ))}
                                    {state.formErrors.permissions && (
                                        <div className="invalid-feedback">
                                            {state.formErrors.permissions}
                                        </div>
                                    )}
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="custom-fields mt-4">
                        <h5>Champs personnalisés</h5>
                        {state.customFields.map((field, index) => {
                            const fieldConfig = customFieldOptions.find(opt => opt.id === field.fieldId);
                            return (
                                <Row key={index} className="g-3 align-items-center mb-2">
                                    <Col md={5}>
                                        <Form.Select
                                            value={field.fieldId}
                                            onChange={(e) => {
                                                const updatedFields = [...state.customFields];
                                                updatedFields[index] = { fieldId: e.target.value, value: "" };
                                                dispatch({ type: "SET_FIELD", field: "customFields", value: updatedFields });
                                            }}
                                        >
                                            <option value="">Sélectionner un champ</option>
                                            {customFieldOptions.map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={5}>
                                        {fieldConfig?.type === "select" ? (
                                            <Form.Select
                                                value={field.value}
                                                onChange={(e) => dispatch({
                                                    type: "UPDATE_CUSTOM_FIELD",
                                                    index,
                                                    value: e.target.value,
                                                })}
                                            >
                                                <option value="">Sélectionner une valeur</option>
                                                {fieldConfig.options.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        ) : fieldConfig?.type === "date" ? (
                                            <Form.Control
                                                type="date"
                                                value={field.value}
                                                onChange={(e) => dispatch({
                                                    type: "UPDATE_CUSTOM_FIELD",
                                                    index,
                                                    value: e.target.value,
                                                })}
                                            />
                                        ) : (
                                            <Form.Control
                                                type="text"
                                                placeholder="Valeur"
                                                value={field.value}
                                                onChange={(e) => dispatch({
                                                    type: "UPDATE_CUSTOM_FIELD",
                                                    index,
                                                    value: e.target.value,
                                                })}
                                            />
                                        )}
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            variant="danger"
                                            onClick={() => dispatch({ type: "DELETE_CUSTOM_FIELD", index })}
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                padding: "0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </Col>
                                </Row>
                            );
                        })}
                        <Button
                            variant="outline-primary"
                            className="mt-2"
                            onClick={() => dispatch({ type: "ADD_CUSTOM_FIELD", fieldId: "" })}
                        >
                            <FaPlus /> Ajouter un champ
                        </Button>
                    </div>

                    <Button type="submit" className="mt-4 w-100" disabled={state.isSubmitting}>
                        {state.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}