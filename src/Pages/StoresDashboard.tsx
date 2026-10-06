import { Link } from "react-router"

export const Dashboard = () => {
    return (
        <div>
            <h1>Dashboard</h1>
            <button className="btn btn-primary"><Link to='/login'>Setup</Link></button>
        </div>
    )
}