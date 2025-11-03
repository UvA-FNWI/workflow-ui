import {Link} from "react-router";

function Overview() {
    return (
        <div>
            <h1>Overview</h1>
            <nav>
                <Link to="/workflows">Workflows</Link>
                <Link to="/instance/1">Instance 1</Link>
                <Link to="/instance/2">Instance 2</Link>
                <Link to="/instance/3">Instance 3</Link>
            </nav>
        </div>
    );
}

export default Overview;
