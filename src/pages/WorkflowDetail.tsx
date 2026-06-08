import {useParams} from "react-router";

import {VersionedLink} from "~/components/VersionedLink";

function WorkflowDetail() {
    const {id} = useParams<{id: string}>();

    return (
        <div>
            <nav>
                <VersionedLink to="/workflows">← Workflows</VersionedLink>
                <VersionedLink to="/">Overview</VersionedLink>
            </nav>
            <h1>Workflow {id}</h1>
            <p>Status: Active</p>
            <p>Description: This is a sample workflow.</p>
        </div>
    );
}

export default WorkflowDetail;
