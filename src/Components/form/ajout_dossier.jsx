import { useReducer } from "react";
import { Offcanvas, Form, Button, Row, Col } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";

const predefinedPermissions = ["Lecture", "Écriture", "Admin"];

const initialState = {
    identifiant: "",
    codebarres: "",
    nomDossier: "",
    description: "",
    permissions: [],
    customFields: [],
    formErrors: {},
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
            return {
                ...state,
                formErrors: action.errors,
            };
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { nom: "", type: "", correspondA: "" }],
            };
        case "DELETE_CUSTOM_FIELD":
            return {
                ...state,
                customFields: state.customFields.filter((_, index) => index !== action.index),
            };
        case "UPDATE_CUSTOM_FIELD":
            const updatedFields = [...state.customFields];
            updatedFields[action.index][action.key] = action.value;
            return { ...state, customFields: updatedFields };
        case "RESET_FORM":
            return initialState;
        default:
            return state;
    }
};

export default function FolderForm({ show, onHide, onSwitchToProductForm }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateForm = () => {
        const errors = {};
        if (!state.identifiant) errors.identifiant = "L'identifiant est requis.";
        if (!state.codebarres) errors.codebarres = "Le code-barres est requis.";
        if (!state.nomDossier) errors.nomDossier = "Le nom du dossier est requis.";
        if (!state.permissions.length) errors.permissions = "Au moins une permission est requise.";
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        dispatch({ type: "SET_FORM_ERRORS", errors });

        if (Object.keys(errors).length === 0) {
            console.log("Form Data Submitted:", state);
            dispatch({ type: "RESET_FORM" });
            onHide();
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

    const handleReturn = () => {
        dispatch({ type: "RESET_FORM" });
        onSwitchToProductForm();
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <div className="d-flex flex-column w-100">
                    <Button
                        variant="link"
                        onClick={handleReturn}
                        className="p-0 text-decoration-none text-secondary align-self-start mb-2"
                    >
                        Retour au formulaire produit
                    </Button>
                    <Offcanvas.Title className="h4">Ajouter un Dossier</Offcanvas.Title>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmit} noValidate>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Identifiant *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer l'identifiant"
                                    value={state.identifiant}
                                    onChange={(e) => handleFieldChange("identifiant", e.target.value)}
                                    isInvalid={!!state.formErrors.identifiant}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.identifiant}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Code-barres *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer le code-barres"
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
                                <Form.Label>Nom du dossier *</Form.Label>
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
                                <Form.Label>Description</Form.Label>
                                <Form.Control
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
                                <Form.Label>Permissions *</Form.Label>
                                <Form.Select
                                    multiple
                                    value={state.permissions}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        handleFieldChange("permissions", values);
                                    }}
                                    isInvalid={!!state.formErrors.permissions}
                                >
                                    {predefinedPermissions.map((perm, index) => (
                                        <option key={index} value={perm}>
                                            {perm}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.permissions}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="custom-fields mt-4">
                        <h5>Champs personnalisés</h5>
                        {state.customFields.map((field, index) => (
                            <Row key={index} className="g-3 align-items-center mb-2">
                                <Col md={3}>
                                    <Form.Control
                                        placeholder="Nom"
                                        value={field.nom}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "UPDATE_CUSTOM_FIELD",
                                                index,
                                                key: "nom",
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        placeholder="Type"
                                        value={field.type}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "UPDATE_CUSTOM_FIELD",
                                                index,
                                                key: "type",
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Control
                                        placeholder="Correspond à"
                                        value={field.correspondA}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "UPDATE_CUSTOM_FIELD",
                                                index,
                                                key: "correspondA",
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
                        <Button
                            variant="outline-primary"
                            className="mt-2"
                            onClick={() => dispatch({ type: "ADD_CUSTOM_FIELD" })}
                        >
                            <FaPlus /> Ajouter un champ
                        </Button>
                    </div>

                    <Button type="submit" className="mt-4 w-50">
                        Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}