import { Offcanvas } from "react-bootstrap";

export default function CreateChart({ showChart, handleCloseChart }) {
    return (
        <Offcanvas show={showChart} onHide={handleCloseChart} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Create Chart</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <p>This is where you can add the chart creation form or logic.</p>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
