import express from "express";

import {formSubmitted} from "./data/formSubmitted.ts";
import {projectsScreen} from "./data/projectsScreen.ts";

const app = express();
app.use(express.json());

app.use(function (_, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/WorkflowInstances/form-submitted", (_, res) => {
    res.json(formSubmitted);
});

app.get("/Screens/Grouped/Project/Projects", (_, res) => {
    res.json(projectsScreen);
});

const PORT = 5025;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
