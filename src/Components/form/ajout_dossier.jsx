import { useReducer } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import {FaFolderPlus, FaPlus, FaTrash} from "react-icons/fa";
import '../../CSS/ajout_produit.css'

const predefinedPermissions = ["Lecture", "Suppression", "Modification"];
const initialState = {
    identifiant: "",
    codebarres: "",
    nomDossier: "",
    description: "",
    permissions: [],
    customFields: [],
    categories: ["Catégorie 1", "Catégorie 2"],
    emplacements: ["Emplacement 1", "Emplacement 2"],
    newCategory: "",
    newEmplacement: "",
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
        case "ADD_CATEGORY":
            if (!state.newCategory.trim()) return state;
            return {
                ...state,
                categories: [...state.categories, state.newCategory.trim()],
                newCategory: "",
            };
        case "ADD_EMPLACEMENT":
            if (!state.newEmplacement.trim()) return state;
            return {
                ...state,
                emplacements: [...state.emplacements, state.newEmplacement.trim()],
                newEmplacement: "",
            };
        case "SET_FORM_ERRORS":
            return {
                ...state,
                formErrors: action.errors,
            };
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { name: "", value: "" }],
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

export default function FolderForm({ show, onHide, onSwitchToProductForm, isFromProductForm }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateForm = () => {
        const errors = {};
        if (!state.identifiant.trim()) errors.identifiant = "L'identifiant est requis.";
        if (!state.codebarres.trim()) errors.codebarres = "Le code-barres est requis.";
        if (!state.permissions.length) errors.permissions = "Au moins une permission est requise.";
        if (!state.titre?.trim()) errors.titre = "Le titre est requis.";
        if (!state.quantite?.toString().trim()) errors.quantite = "La quantité est requise.";
        if (!state.prix?.toString().trim()) errors.prix = "Le prix est requis.";
        if (!state.quantiteDisponible?.toString().trim()) errors.quantiteDisponible = "La quantité disponible est requise.";
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        dispatch({ type: "SET_FORM_ERRORS", errors });

        if (Object.keys(errors).length === 0) {
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
                <Form onSubmit={handleSubmit} noValidate>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Titre *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer le titre"
                                    value={state.titre}
                                    onChange={(e) => handleFieldChange("titre", e.target.value)}
                                    isInvalid={!!state.formErrors.titre}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.titre}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantité *</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Entrer la quantité"
                                    value={state.quantite}
                                    onChange={(e) => handleFieldChange("quantite", e.target.value)}
                                    isInvalid={!!state.formErrors.quantite}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.quantite}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prix *</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Entrer le prix"
                                    value={state.prix}
                                    onChange={(e) => handleFieldChange("prix", e.target.value)}
                                    isInvalid={!!state.formErrors.prix}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.prix}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantité Disponible *</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Entrer la quantité disponible"
                                    value={state.quantiteDisponible}
                                    onChange={(e) => handleFieldChange("quantiteDisponible", e.target.value)}
                                    isInvalid={!!state.formErrors.quantiteDisponible}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.quantiteDisponible}
                                </Form.Control.Feedback>
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
                                        {state.categories.map((category, index) => (
                                            <option key={index} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouvelle catégorie"
                                        value={state.newCategory}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "newCategory", value: e.target.value })}
                                    />
                                    <Button variant="outline-primary" onClick={() => dispatch({ type: "ADD_CATEGORY" })}>
                                        <FaPlus />
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {state.formErrors.category}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Emplacement *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        value={state.emplacement}
                                        onChange={(e) => handleFieldChange("emplacement", e.target.value)}
                                        isInvalid={!!state.formErrors.emplacement}
                                    >
                                        <option value="">Sélectionner un emplacement</option>
                                        {state.emplacements.map((emplacement, index) => (
                                            <option key={index} value={emplacement}>
                                                {emplacement}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouvel emplacement"
                                        value={state.newEmplacement}
                                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "newEmplacement", value: e.target.value })}
                                    />
                                    <Button variant="outline-primary" onClick={() => dispatch({ type: "ADD_EMPLACEMENT" })}>
                                        <FaPlus />
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {state.formErrors.emplacement}
                                    </Form.Control.Feedback>
                                </InputGroup>
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
                        {state.customFields.length === 0 && (
                            <div className="text-muted">Aucun champ personnalisé ajouté.</div>
                        )}
                        {state.customFields.map((field, index) => (
                            <Row key={index} className="g-3 align-items-center mb-2">
                                <Col md={5}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nom du champ"
                                        value={field.name}
                                        onChange={(e) =>
                                            dispatch({
                                                type: "UPDATE_CUSTOM_FIELD",
                                                index,
                                                key: "name",
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col md={5}>
                                    <Form.Control
                                        type="text"
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
                                        variant="danger"
                                        onClick={() =>
                                            dispatch({ type: "DELETE_CUSTOM_FIELD", index })
                                        }
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
                        ))}
                        <Button
                            variant="outline-primary"
                            className="mt-2"
                            onClick={() => dispatch({ type: "ADD_CUSTOM_FIELD" })}
                        >
                            <FaPlus /> Ajouter un champ
                        </Button>
                    </div>

                    <Button type="submit" className="mt-4 w-100">
                        Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}