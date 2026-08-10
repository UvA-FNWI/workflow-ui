import express from "express";

import {formSubmitted} from "./data/formSubmitted.ts";
import {
    instanceProperties,
    propertiesInstance,
    propertiesInstanceNonAdmin,
} from "./data/instanceProperties.ts";
import {projectsScreen} from "./data/projectsScreen.ts";

const app = express();
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.get("/Users/Me", (_, res) => {
    res.json({id: "test-user", name: "Test User", email: "test@example.com"});
});

app.get("/WorkflowInstances/form-submitted", (_, res) => {
    res.json(formSubmitted);
});

app.get("/Screens/Project/Projects", (_, res) => {
    res.json(projectsScreen);
});

app.get("/WorkflowInstances/context-admin", (_, res) => {
    res.json(propertiesInstance);
});

app.get("/WorkflowInstances/context-plain", (_, res) => {
    res.json(propertiesInstanceNonAdmin);
});

// Denied users are redirected before this 403 is shown.
app.get("/WorkflowInstances/:id/Properties", (req, res) => {
    if (req.params.id === propertiesInstanceNonAdmin.id) {
        return res.status(403).json({code: "Forbidden", message: "Access forbidden"});
    }
    res.json(instanceProperties);
});

app.post("/WorkflowInstances/:id/Properties/:path", (req, res) => {
    const {path} = req.params;
    instanceProperties.values[path] = req.body.value;
    if (path === "Name") propertiesInstance.title = req.body.value;
    res.sendStatus(204);
});

const PORT = 5025;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
