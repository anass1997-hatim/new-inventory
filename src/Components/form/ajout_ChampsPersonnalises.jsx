import { useReducer, useEffect } from "react";
import { Offcanvas, Form, Button, Row, Col, Alert } from "react-bootstrap";
import {FaClipboardList} from "react-icons/fa";
import { MoonLoader } from "react-spinners";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const initialState = {
    categories: [],
    sousCategories: [],
    marques: [],
    modeles: [],
    familles: [],
    sousFamilles: [],
    selectedCategory: null,
    selectedSousCategorie: null,
    selectedSousCategorieParent: null,
    selectedMarque: null,
    selectedModel: null,
    selectedModelParent: null,
    selectedFamille: null,
    selectedSousFamille: null,
    selectedSousFamilleParent: null,
    newCategory: "",
    newSousCategorie: "",
    newMarque: "",
    newModel: "",
    newFamille: "",
    newSousFamille: "",
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
    async createData(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Creation failed");
        return await response.json();
    },
    async saveChamp(data) {
        const response = await fetch(`${API_BASE_URL}/champs-personnalises/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to save champ");
        return await response.json();
    }
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value };
        case "SET_DATA":
            return { ...state, ...action.payload, loading: false };
        case "ADD_CATEGORY":
            return { ...state, categories: [...state.categories, action.category] };
        case "ADD_SOUS_CATEGORIE":
            return { ...state, sousCategories: [...state.sousCategories, action.sousCategorie] };
        case "ADD_MARQUE":
            return { ...state, marques: [...state.marques, action.marque] };
        case "ADD_MODEL":
            return { ...state, modeles: [...state.modeles, action.model] };
        case "ADD_FAMILLE":
            return { ...state, familles: [...state.familles, action.famille] };
        case "ADD_SOUS_FAMILLE":
            return { ...state, sousFamilles: [...state.sousFamilles, action.sousFamille] };
        case "SET_LOADING":
            return { ...state, loading: action.loading };
        case "SET_ERROR":
            return { ...state, error: action.error };
        case "SET_SUBMITTING":
            return { ...state, isSubmitting: action.isSubmitting };
        case "RESET_FORM":
            return initialState;
        default:
            return state;
    }
};

export default function ChampForm({ show, onHide }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categories, sousCategories, marques, modeles, familles, sousFamilles] = await Promise.all([
                    apiService.fetchData("categories"),
                    apiService.fetchData("sous-categories"),
                    apiService.fetchData("marques"),
                    apiService.fetchData("modeles"),
                    apiService.fetchData("familles"),
                    apiService.fetchData("sous-familles")
                ]);
                dispatch({ type: "SET_DATA", payload: { categories, sousCategories, marques, modeles, familles, sousFamilles } });
            } catch (error) {
                dispatch({ type: "SET_ERROR", error: error.message });
            }
        };
        fetchData();
    }, []);

    const handleCreate = async (endpoint, field, value, parentEndpoint) => {
        try {
            const data = parentEndpoint ? { [parentEndpoint]: value.parentId, [field]: value.value } : { [field]: value };
            const result = await apiService.createData(endpoint, data);
            dispatch({ type: `ADD_${field.toUpperCase()}`, [field.toLowerCase()]: result });
            dispatch({ type: "SET_FIELD", field: `new${field}`, value: "" });
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: "SET_SUBMITTING", isSubmitting: true });
        try {
            await apiService.saveChamp({
                sousCategorie: state.selectedSousCategorie,
                marque: state.selectedMarque,
                model: state.selectedModel,
                famille: state.selectedFamille,
                sousFamille: state.selectedSousFamille
            });
            dispatch({ type: "RESET_FORM" });
            onHide();
        } catch (error) {
            dispatch({ type: "SET_ERROR", error: error.message });
        } finally {
            dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
        }
    };

    if (state.loading) {
        return <div className="loading-overlay"><MoonLoader color="#105494" size={60} /></div>;
    }

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" className="offcanvas-folder">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className="h4"><FaClipboardList className="me-2" />Gestion des Champs</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {state.error && <Alert variant="danger">{state.error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h5>Catégories</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select value={state.selectedCategory || ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedCategory", value: e.target.value })}>
                                    <option value="">Sélectionner une catégorie</option>
                                    {state.categories.map(c => (
                                        <option key={c.idCategorie} value={c.idCategorie}>{c.categorie}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouvelle catégorie"
                                    value={state.newCategory}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newCategory", value: e.target.value })}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button onClick={() => handleCreate("categories", "categorie", state.newCategory)}>
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4">
                        <h5>Sous-Catégories</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedSousCategorieParent || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedSousCategorieParent", value: e.target.value })}
                                >
                                    <option value="">Sélectionner une catégorie </option>
                                    {state.categories.map(c => (
                                        <option key={c.idCategorie} value={c.idCategorie}>{c.categorie}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedSousCategorie || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedSousCategorie", value: e.target.value })}
                                    disabled={!state.selectedSousCategorieParent}
                                >
                                    <option value="">Sélectionner une sous-catégorie</option>
                                    {state.sousCategories
                                        .filter(sc => sc.categorie === state.selectedSousCategorieParent)
                                        .map(sc => (
                                            <option key={sc.idSousCategorie} value={sc.idSousCategorie}>{sc.sousCategorie}</option>
                                        ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouvelle sous-catégorie"
                                    value={state.newSousCategorie}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newSousCategorie", value: e.target.value })}
                                    disabled={!state.selectedSousCategorieParent}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    onClick={() => handleCreate("sous-categories", "sousCategorie", { parentId: state.selectedSousCategorieParent, value: state.newSousCategorie }, "categorie")}
                                    disabled={!state.selectedSousCategorieParent}
                                >
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4">
                        <h5>Marques</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select value={state.selectedMarque || ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedMarque", value: e.target.value })}>
                                    <option value="">Sélectionner une marque</option>
                                    {state.marques.map(m => (
                                        <option key={m.idMarque} value={m.idMarque}>{m.marque}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouvelle marque"
                                    value={state.newMarque}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newMarque", value: e.target.value })}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button onClick={() => handleCreate("marques", "marque", state.newMarque)}>
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4">
                        <h5>Modèles</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedModelParent || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedModelParent", value: e.target.value })}
                                >
                                    <option value="">Sélectionner une marque </option>
                                    {state.marques.map(m => (
                                        <option key={m.idMarque} value={m.idMarque}>{m.marque}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedModel || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedModel", value: e.target.value })}
                                    disabled={!state.selectedModelParent}
                                >
                                    <option value="">Sélectionner un modèle</option>
                                    {state.modeles
                                        .filter(m => m.marque === state.selectedModelParent)
                                        .map(m => (
                                            <option key={m.idModel} value={m.idModel}>{m.model}</option>
                                        ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouveau modèle"
                                    value={state.newModel}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newModel", value: e.target.value })}
                                    disabled={!state.selectedModelParent}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    onClick={() => handleCreate("modeles", "model", { parentId: state.selectedModelParent, value: state.newModel }, "marque")}
                                    disabled={!state.selectedModelParent}
                                >
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4">
                        <h5>Familles</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select value={state.selectedFamille || ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedFamille", value: e.target.value })}>
                                    <option value="">Sélectionner une famille</option>
                                    {state.familles.map(f => (
                                        <option key={f.idFamille} value={f.idFamille}>{f.famille}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouvelle famille"
                                    value={state.newFamille}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newFamille", value: e.target.value })}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button onClick={() => handleCreate("familles", "famille", state.newFamille)}>
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div className="mb-4">
                        <h5>Sous-Familles</h5>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedSousFamilleParent || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedSousFamilleParent", value: e.target.value })}
                                >
                                    <option value="">Sélectionner une famille</option>
                                    {state.familles.map(f => (
                                        <option key={f.idFamille} value={f.idFamille}>{f.famille}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2 mb-3">
                            <Col>
                                <Form.Select
                                    value={state.selectedSousFamille || ""}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "selectedSousFamille", value: e.target.value })}
                                    disabled={!state.selectedSousFamilleParent}
                                >
                                    <option value="">Sélectionner une sous-famille</option>
                                    {state.sousFamilles
                                        .filter(sf => sf.famille === state.selectedSousFamilleParent)
                                        .map(sf => (
                                            <option key={sf.idSousFamille} value={sf.idSousFamille}>{sf.sousFamille}</option>
                                        ))}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    placeholder="Nouvelle sous-famille"
                                    value={state.newSousFamille}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "newSousFamille", value: e.target.value })}
                                    disabled={!state.selectedSousFamilleParent}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    onClick={() => handleCreate("sous-familles", "sousFamille", { parentId: state.selectedSousFamilleParent, value: state.newSousFamille }, "famille")}
                                    disabled={!state.selectedSousFamilleParent}
                                >
                                    Ajouter
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}