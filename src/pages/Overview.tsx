import {Link} from "react-router";

function Overview() {
    return (
        <div>
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
        </div>
    );
}

export default Overview;
