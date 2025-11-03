import {execSync} from "child_process";
import * as fs from "fs";
import {fileURLToPath} from "url";

function getBranchName() {
    const out = execSync("git rev-parse --abbrev-ref HEAD", {encoding: "utf-8"});
    return out.trim();
}

function commitPrefix() {
    const branchName = getBranchName();
    const matching = branchName.match(/([a-z]+\/([a-z]+-\d+)(?:-.+)?)|([a-z]+-\d+)(?:-.+)?/i);

    if (matching) {
        return matching.filter(Boolean).pop();
    }
    return "";
}

function prefixPrettifier() {
    return commitPrefix();
}

function addBranchKey(commitFile) {
    try {
        let content = fs.readFileSync(commitFile, "utf-8");
        const prefix = prefixPrettifier();
        if (content.includes(prefix)) {
            return;
        }
        fs.writeFileSync(commitFile, `${prefix} ${content}`);
    } catch (error) {
        console.error("Error reading/writing commit file:", error.message);
        process.exit(1);
    }
}

const __filename = fileURLToPath(import.meta.url);
if (__filename === process.argv[1]) {
    if (process.argv.length < 3) {
        console.error("Please check the COMMIT_EDITMSG path and commit message");
        process.exit(1);
    }

    const commitFile = process.argv[2];
    addBranchKey(commitFile);
}
