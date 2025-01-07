import { useState } from "react";
import { Dropdown, InputGroup, Nav } from "react-bootstrap";
import rfid_img from '../../images/rfid.png';
import '../../CSS/index.css';
import CreateChart from "../form/create_chart";
import { FaPlus } from "react-icons/fa";
import dataAnalyst from "../../images/data_analyst.png";
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
    ArcElement,
    RadarController,
    RadialLinearScale,
} from 'chart.js';

ChartJS.register(
    BarElement,
    ArcElement,
    RadarController,
    RadialLinearScale,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Index() {
    const [showChart, setShowChart] = useState(false);
    const [chartType, setChartType] = useState('line');
    const [activeTab, setActiveTab] = useState('Commencer');

    const handleCreateChart = () => {
        setShowChart(true);
    };

    const handleCloseChart = () => {
        setShowChart(false);
    };

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Ventes mensuelles',
                data: [3000, 4000, 2500, 5000, 6000, 7000],
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
            }
        ]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 16
                    },
                    color: 'rgba(0, 0, 0, 0.7)',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 12
                }
            }
        }
    };

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return <Bar data={chartData} options={chartOptions} />;
            case 'pie':
                return <Pie data={chartData} options={chartOptions} />;
            case 'radar':
                return <Radar data={chartData} options={chartOptions} />;
            case 'doughnut':
                return <Doughnut data={chartData} options={chartOptions} />;
            case 'line':
            default:
                return <Line data={chartData} options={chartOptions} />;
        }
    };

    const renderDashboard = () => (
        <>
            <div className="chart-buttons-container">
                <button onClick={handleCreateChart} className="add-graph">
                    <FaPlus style={{ marginRight: '5px' }} /> Créer un Graphique
                </button>
                <InputGroup className="printer-v2-search-input">
                    <InputGroup.Text className="icon-prod-v2">Type de Graphique</InputGroup.Text>
                    <Dropdown>
                        <Dropdown.Toggle className="printer-v2-dropdown">Choix de graphique</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setChartType('line')}>Lines</Dropdown.Item>
                            <Dropdown.Item onClick={() => setChartType('bar')}>barres</Dropdown.Item>
                            <Dropdown.Item onClick={() => setChartType('pie')}>Pie</Dropdown.Item>
                            <Dropdown.Item onClick={() => setChartType('radar')}>radar</Dropdown.Item>
                            <Dropdown.Item onClick={() => setChartType('doughnut')}>doughnut</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </InputGroup>
            </div>
            <div className="dashboard-container" style={{ backgroundColor: '#f8f9fa', display: 'flex', flexWrap: 'wrap' }}>
                {showChart ? (
                    <div className="no-chart-instruction" style={{width: '100%'}}>
                        <div className="instruction-content" style={{
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div className="instruction-text" style={{
                                fontSize: '1rem',
                                color: '#333',
                                lineHeight: '1.6',
                                fontFamily: "Roboto",
                                maxWidth: '800px'
                            }}>
                                <p>
                                    <strong>Bienvenue !</strong><br/>
                                    Pour commencer à analyser vos données, cliquez sur <strong>"Créer un
                                    Graphique"</strong> dans le bouton en haut à droite. Sélectionnez ensuite le type de
                                    graphique que vous souhaitez afficher pour visualiser vos données de manière
                                    dynamique et interactive. <br/>
                                    Vous pouvez choisir parmi plusieurs types de graphiques : <em>ligne, barre, radar,
                                    camembert, doughnut...</em> pour obtenir la vue la plus adaptée à vos besoins.
                                </p>
                            </div>
                            <img src={dataAnalyst} alt="Analyst" className="instruction-image"
                                 style={{width: '400px', height: '250px', objectFit: 'cover', marginLeft: '20px'}}/>
                        </div>
                    </div>


                ) : (
                    <>
                        <div className="chart-container" style={{flex: 1, marginRight: '20px'}}>
                            <h3>Ventes Mensuelles</h3>
                            {renderChart()}
                        </div>
                        <div className="kpi-container" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                            <div className="kpi-card" style={{marginBottom: '10px'}}>
                                <h4>Total des Ventes</h4>
                                <p>30,000</p>
                            </div>
                            <div className="kpi-card" style={{marginBottom: '10px'}}>
                                <h4>Produits Vendus</h4>
                                <p>120</p>
                            </div>
                            <div className="kpi-card">
                                <h4>Clients Actifs</h4>
                                <p>85</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Commencer':
                return (
                    <div className="commencer-content" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="commencer-text" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="commencer-text-left" style={{ backgroundColor: '#f8f9fa' }}>
                                <h3>Découvrez notre solution RFID</h3>
                                <p>Notre solution RFID vous permet de gérer facilement votre inventaire en utilisant la technologie de pointe pour un suivi précis et rapide des produits.</p>
                                <p>Grâce à cette technologie, vous pouvez améliorer l'efficacité, réduire les erreurs humaines et garantir la disponibilité des produits en temps réel.</p>
                                <p className="cta-text">Commencez maintenant et améliorez votre gestion d'inventaire !</p>
                            </div>
                            <img src={rfid_img} alt="RFID" className="commencer-image" />
                        </div>
                    </div>
                );
            case 'Mises à jour récentes':
                return (
                    <div className="updates-container" style={{ backgroundColor: '#f8f9fa' }}>
                        <h3>Dernières Mises à Jour</h3>
                        <div className="update-item">
                            <h4>Mise à jour 1</h4>
                            <p>Nouvelle fonctionnalité de suivi des stocks en temps réel. Vous pouvez désormais consulter l'état de votre inventaire en direct.</p>
                        </div>
                        <div className="update-item">
                            <h4>Mise à jour 2</h4>
                            <p>Amélioration de l'interface utilisateur pour une navigation plus fluide et intuitive.</p>
                        </div>
                        <div className="update-item">
                            <h4>Mise à jour 3</h4>
                            <p>Ajout de la possibilité de créer des alertes personnalisées pour les produits nécessitant un réapprovisionnement.</p>
                        </div>
                    </div>
                );
            case 'Tableau de bord':
                return renderDashboard();
            case 'Annonces':
                return <div style={{ backgroundColor: '#f8f9fa' }}>Restez à jour avec les dernières annonces et nouvelles concernant l'application.</div>;
            default:
                return <div style={{ backgroundColor: '#f8f9fa' }}>Sélectionnez un onglet</div>;
        }
    };

    return (
        <>
            <div className="index-tabs" style={{ backgroundColor: '#f8f9fa' }}>
                <Nav variant="tabs" activeKey={activeTab} onSelect={(eventKey) => setActiveTab(eventKey)} className="justify-content-between">
                    <div className="d-flex">
                        <Nav.Item>
                            <Nav.Link eventKey="Commencer" className="nav-link-content">
                                Commencer
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Mises à jour récentes">Mises à jour récentes</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Tableau de bord">Tableau de bord</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="Annonces">Annonces</Nav.Link>
                        </Nav.Item>
                    </div>
                </Nav>

                <div className="tab-content mt-3" style={{ backgroundColor: '#f8f9fa' }}>
                    {renderTabContent()}
                </div>
            </div>

            <CreateChart showChart={showChart} handleCloseChart={handleCloseChart} />
        </>
    );
}