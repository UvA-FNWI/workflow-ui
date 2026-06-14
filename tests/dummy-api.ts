import express from "express";

import {formSubmitted} from "./data/formSubmitted.ts";
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

const PORT = 5025;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
