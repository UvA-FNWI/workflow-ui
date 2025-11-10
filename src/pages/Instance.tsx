import { useParams, Link } from "react-router";

function Instance() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <nav>
        <Link to="/">← Overview</Link>
      </nav>
      <h1>Instance {id}</h1>
    </div>
  );
}

export default Instance;
