import { Offcanvas, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { FaCamera, FaPlus, FaTrash } from "react-icons/fa";
import { useReducer } from "react";
import "../../CSS/add_folder.css";

const initialState = {
    image: null,
    identifiant: "",
    barcode: "",
    location: "",
    category: "",
    keywords: "",
    description: "",
    customFields: [],
    categories: ["Catégorie 1", "Catégorie 2"],
    keywordsList: ["Mot-clé 1", "Mot-clé 2"],
    formErrors: {},
    newCategory: "",
    newKeyword: "",
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return {
                ...state,
                [action.field]: action.value,
                formErrors: {
                    ...state.formErrors,
                    [action.field]: action.value.trim() === "" ? `${action.field} est requis.` : undefined,
                },
            };
        case "ADD_CATEGORY":
            if (!state.newCategory.trim()) {
                return {
                    ...state,
                    formErrors: {
                        ...state.formErrors,
                        newCategory: "Veuillez sélectionner une catégorie existante ou en ajouter une nouvelle."
                    },
                };
            }
            return {
                ...state,
                categories: [...state.categories, state.newCategory.trim()],
                newCategory: "",
                formErrors: {
                    ...state.formErrors,
                    newCategory: undefined
                },
            };
        case "ADD_KEYWORD":
            if (!state.newKeyword.trim()) {
                return {
                    ...state,
                    formErrors: {
                        ...state.formErrors,
                        newKeyword: "Le mot-clé ne peut pas être vide."
                    },
                };
            }
            return {
                ...state,
                keywordsList: [...state.keywordsList, state.newKeyword.trim()],
                newKeyword: "",
                formErrors: {
                    ...state.formErrors,
                    newKeyword: undefined
                },
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
        case "SET_ERRORS":
            return { ...state, formErrors: action.errors };
        case "DELETE_IMAGE":
            return { ...state, image: null };
        case "RESET_FORM":
            return initialState;
        default:
            return state;
    }
};


export default function ProductForm({ show, onHide, placement }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const validateForm = () => {
        const errors = {};
        if (!state.identifiant.trim()) errors.identifiant = "L'identifiant est requis.";
        if (!state.barcode.trim()) errors.barcode = "Le code-barres est requis.";
        if (!state.location.trim()) errors.location = "L'emplacement est requis.";
        if (!state.category.trim()) errors.category = "Veuillez sélectionner ou ajouter une catégorie.";
        if (!state.keywords.trim()) errors.keywords = "Veuillez sélectionner ou ajouter un mot-clé.";
        return errors;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            dispatch({ type: "SET_ERRORS", errors });
            return;
        }
        console.log("Form Data Submitted:", state);
        dispatch({ type: "RESET_FORM" });
        onHide();
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement={placement} className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Ajouter un dossier</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>
                        <div className="d-flex align-items-center gap-3">
                            <div className="file-input-wrapper">
                                <label htmlFor="fileInput" className="file-input-icon">
                                    <FaCamera />
                                </label>
                                <Form.Control
                                    id="fileInput"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) =>
                                        dispatch({
                                            type: "SET_FIELD",
                                            field: "image",
                                            value: e.target.files[0],
                                        })
                                    }
                                    style={{ display: "none" }}
                                />
                            </div>
                            {state.image && (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="image-name-folder">{state.image.name}</span>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => dispatch({ type: "DELETE_IMAGE" })}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Form.Group>

                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Identifiant *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="identifiant"
                                    placeholder="Entrer l'identifiant"
                                    value={state.identifiant}
                                    onChange={(e) =>
                                        dispatch({ type: "SET_FIELD", field: "identifiant", value: e.target.value })
                                    }
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
                                    name="barcode"
                                    placeholder="Entrer le code-barres"
                                    value={state.barcode}
                                    onChange={(e) =>
                                        dispatch({ type: "SET_FIELD", field: "barcode", value: e.target.value })
                                    }
                                    isInvalid={!!state.formErrors.barcode}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.barcode}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Catégorie *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        name="category"
                                        value={state.category}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", field: "category", value: e.target.value })
                                        }
                                        isInvalid={!!state.formErrors.category}
                                        className="category-select-folder"
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {state.categories.map((cat, index) => (
                                            <option key={index} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouvelle catégorie"
                                        value={state.newCategory}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", field: "newCategory", value: e.target.value })
                                        }
                                        isInvalid={!!state.formErrors.newCategory}
                                    />
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => dispatch({ type: "ADD_CATEGORY" })}
                                    >
                                        <FaPlus />
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {state.formErrors.category}
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.category}
                                </Form.Control.Feedback>
                                {state.formErrors.newCategory && (
                                    <div className="text-danger mt-1">
                                        {state.formErrors.newCategory}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>


                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mots-clés *</Form.Label>
                                <InputGroup>
                                    <Form.Select
                                        name="keywords"
                                        value={state.keywords}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", field: "keywords", value: e.target.value })
                                        }
                                        isInvalid={!!state.formErrors.keywords}
                                        className="category-select-folder"
                                    >
                                        <option value="">Sélectionner un mot-clé</option>
                                        {state.keywordsList.map((word, index) => (
                                            <option key={index} value={word}>
                                                {word}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control
                                        placeholder="Nouveau mot-clé"
                                        value={state.newKeyword}
                                        onChange={(e) =>
                                            dispatch({ type: "SET_FIELD", field: "newKeyword", value: e.target.value })
                                        }
                                    />
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => dispatch({ type: "ADD_KEYWORD" })}
                                    >
                                        <FaPlus />
                                    </Button>
                                    <Form.Control.Feedback type="invalid">
                                        {state.formErrors.keywords}
                                    </Form.Control.Feedback>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.keywords}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Emplacement *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    placeholder="Entrer l'emplacement"
                                    value={state.location}
                                    onChange={(e) =>
                                        dispatch({ type: "SET_FIELD", field: "location", value: e.target.value })
                                    }
                                    isInvalid={!!state.formErrors.location}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {state.formErrors.location}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="custom-fields mt-4">
                        <h5>Champs personnalisés</h5>
                        {state.customFields.map((field, index) => (
                            <Row key={index} className="g-3 align-items-center mb-2">
                                <Col md={5}>
                                    <Form.Control
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
                                <Col md={2} className="text-center">
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

                    <Button variant="primary" type="submit" className="mt-4 w-100">
                        Enregistrer
                    </Button>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}