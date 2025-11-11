import {Link, useParams} from "react-router";

function Instance() {
    const {id} = useParams<{id: string}>();

    return (
        <div className="bg-red-500 text-black dark:text-white">
            <nav>
                <Link to="/">← Overview</Link>
            </nav>
            <h1>Instance {id}</h1>
        </div>
    );
}

export default Instance;
