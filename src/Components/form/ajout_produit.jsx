import { useReducer } from "react";
import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import {FaBoxOpen, FaPlus,  FaTrash} from "react-icons/fa";
import "../../CSS/ajout_produit.css";

const predefinedFields = [
    "Marque",
    "Modèle",
    "Famille",
    "Sous-famille",
    "Taille",
    "Couleur",
    "Poids",
    "Dimensions",
    "Expiration Date",
];

const initialState = {
    identifiant: "",
    barcode: "",
    titre: "",
    quantite: "",
    prix: "",
    quantiteDisponible: "",
    category: "",
    sousCategorie: "",
    emplacement: "",
    dossier: "",
    customFields: [],
    categories: ["Catégorie 1", "Catégorie 2"],
    emplacements: ["Emplacement 1", "Emplacement 2"],
    newCategory: "",
    newSousCategorie: "",
    newEmplacement: "",
    Dossiers: ["Dossier 1", "Dossier 2"],
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
        case "ADD_CUSTOM_FIELD":
            return {
                ...state,
                customFields: [...state.customFields, { name: "", value: "", dimensionType: "" }],
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

export default function ProductForm({ show, onHide ,  onSwitchToFolderForm    }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const validateForm = () => {
        const errors = {};
        if (!state.identifiant.trim()) errors.identifiant = "L'identifiant est requis.";
        if (!state.barcode.trim()) errors.barcode = "Le code-barres est requis.";
        if (!state.titre.trim()) errors.titre = "Le titre est requis.";
        if (!state.quantite.trim()) errors.quantite = "La quantité est requise.";
        if (!state.prix.trim()) errors.prix = "Le prix est requis.";
        if (!state.quantiteDisponible.trim()) errors.quantiteDisponible = "La quantité disponible est requise.";
        if (!state.category.trim()) errors.category = "Veuillez sélectionner une catégorie.";
        if (!state.emplacement.trim()) errors.emplacement = "Veuillez sélectionner un emplacement.";
        if (!state.dossier) errors.dossier = "Veuillez sélectionner un dossier.";
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
        const error = !value.trim() ? `${field} est requis.` : undefined;
        dispatch({
            type: "SET_FIELD",
            field,
            value,
            error,
        });
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="h4 d-flex align-items-center">
                    <FaBoxOpen style={{ marginRight: "10px" }}/>
                    Ajouter un produit</Offcanvas.Title>
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
                                    value={state.barcode}
                                    onChange={(e) => handleFieldChange("barcode", e.target.value)}
                                    isInvalid={!!state.formErrors.barcode}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.barcode}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
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
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prix *</Form.Label>
                                <Form.Control
                                    type="number"
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
                        <Col md={6}>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Dossiers *</Form.Label>
                            <InputGroup>
                                <Form.Select
                                    value={state.dossier}
                                    onChange={(e) => handleFieldChange("dossier", e.target.value)}
                                    isInvalid={!!state.formErrors.dossier}
                                >
                                    <option value="">Sélectionner un Dossier</option>
                                    {state.Dossiers.map((loc, index) => (
                                        <option key={index} value={loc}>{loc}</option>
                                    ))}
                                </Form.Select>
                                <Button variant="outline-primary" onClick={onSwitchToFolderForm}>
                                    <FaPlus />
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.dossier}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>


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
                                    onChange={(e) =>
                                        dispatch({
                                            type: "SET_FIELD",
                                            field: "newCategory",
                                            value: e.target.value,
                                        })
                                    }
                                />
                                <Button variant="outline-primary" onClick={() => dispatch({ type: "ADD_CATEGORY" })}>
                                    <FaPlus />
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.category}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>





                        <Form.Group className="mb-3">
                            <Form.Label>Emplacement *</Form.Label>
                            <InputGroup>
                                <Form.Select
                                    value={state.emplacement}
                                    onChange={(e) => handleFieldChange("emplacement", e.target.value)}
                                    isInvalid={!!state.formErrors.emplacement}
                                >
                                    <option value="">Sélectionner un emplacement</option>
                                    {state.emplacements.map((loc, index) => (
                                        <option key={index} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control
                                    placeholder="Nouvel emplacement"
                                    value={state.newEmplacement}
                                    onChange={(e) => dispatch({
                                        type: "SET_FIELD",
                                        field: "newEmplacement",
                                        value: e.target.value
                                    })}
                                />
                                <Button variant="outline-primary" onClick={() => dispatch({ type: "ADD_EMPLACEMENT" })}>
                                    <FaPlus />
                                </Button>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.emplacement}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                    </Row>

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
                                        {predefinedFields.map((f, i) => (
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
                        <Button
                            variant="outline-primary"
                            className="mt-2"
                            onClick={() => dispatch({ type: "ADD_CUSTOM_FIELD" })}
                        >
                            <FaPlus /> Ajouter un champ
                        </Button>
                    </div>

                    <Button type="submit" className="mt-1 w-50">Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}