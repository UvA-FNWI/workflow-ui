import React from "react";

import {Link} from "react-router";

import {Checkbox, Text} from "@datanose/ui";

function Overview() {
    const [checked, setChecked] = React.useState(false);
    return (
        <div>
            <h1>Overview</h1>
            <nav>
                <Link to="/workflows">Workflows</Link>
                <Link to="/instance/1">Instance 1</Link>
                <Link to="/instance/2">Instance 2</Link>
                <Link to="/instance/3">Instance 3</Link>
            </nav>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <p>Welcome to the Workflow UI Overview page.</p>
                <p>Here are some examples to get started with the UI kit:</p>
                <Checkbox isSelected={checked} onChange={setChecked} label="Example checkbox" />
                <Text>The checkbox is {checked ? "checked" : "unchecked"}.</Text>
            </div>
        </div>
    );
}

export default Overview;
