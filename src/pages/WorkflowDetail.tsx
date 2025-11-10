import {useParams, Link} from "react-router";

function WorkflowDetail() {
    const {id} = useParams<{id: string}>();

    return (
        <div>
            <nav>
                <Link to="/workflows">← Workflows</Link>
                <Link to="/">Overview</Link>
            </nav>
            <h1>Workflow {id}</h1>
            <p>Status: Active</p>
            <p>Description: This is a sample workflow.</p>
        </div>
    );
}

export default WorkflowDetail;
