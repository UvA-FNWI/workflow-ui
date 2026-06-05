import {Container} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

function Overview() {
    return (
        <Container>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <p>Welcome to the Workflow UI Overview page.</p>
            </div>
            <nav>
                <VersionedLink to="/screens/project-overview">
                    Project overview screen
                </VersionedLink>
            </nav>
        </Container>
    );
}

export default Overview;
