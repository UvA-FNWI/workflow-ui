import {Link} from "react-router";

import {Container} from "@datanose/ui";

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
                <Link to="/screens/project-overview">Project overview screen</Link>
            </nav>
        </Container>
    );
}

export default Overview;
