import { useReducer } from "react";
import { Offcanvas, Form, Button, Row, Col,  } from "react-bootstrap";
import { FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";
import "../../CSS/ajout_emplacement.css";

const initialState = {
    identifiant: "",
    emplacement: "",
    customFields: [],
    formErrors: {},
};

const predefinedFields = [
    "Zone",
    "Étage",
    "Section",
    "Description",
];

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

export default function AjoutEmplacement({ show, onHide }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateForm = () => {
        const errors = {};
        if (!state.identifiant.trim()) errors.identifiant = "L'identifiant est requis.";
        if (!state.emplacement.trim()) errors.emplacement = "L'emplacement est requis.";
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
        const error = !value.trim() ? `${field} est requis.` : undefined;
        dispatch({
            type: "SET_FIELD",
            field,
            value,
            error,
        });
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-emplacement">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="h4 d-flex align-items-center">
                    <FaMapMarkerAlt style={{ marginRight: "10px" }} /> Ajouter un emplacement
                </Offcanvas.Title>
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
                                <Form.Label>Emplacement *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Entrer l'emplacement"
                                    value={state.emplacement}
                                    onChange={(e) => handleFieldChange("emplacement", e.target.value)}
                                    isInvalid={!!state.formErrors.emplacement}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.emplacement}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
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

                    <Button type="submit" className="mt-3 w-50">
                        Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
