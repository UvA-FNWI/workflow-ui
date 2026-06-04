import {VersionedLink} from "~/components/VersionedLink";

function WorkflowList() {
    return (
        <div>
            <h1>Workflows</h1>
            <nav>
                <VersionedLink to="/">← Overview</VersionedLink>
            </nav>
            Workflows list here
        </div>
    );
}

export default WorkflowList;
