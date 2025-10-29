import { Link } from "react-router";

function WorkflowList() {
  return (
    <div>
      <h1>Workflows</h1>
      <nav>
        <Link to="/">← Overview</Link>
      </nav>
      Workflows list here
    </div>
  );
}

export default WorkflowList;
