import { useNavigate } from "react-router";
import type { BackButtonProps } from "../types";
import { useUser } from "../context/UserContext";

export const BackButton = ({ to, label = "Back", classStyle = "btn-outline" }: BackButtonProps) => {
    const navigate = useNavigate();
    const { user } = useUser();

    // Fallback is either the provided 'to' or the user's role-based dashboard.
    const fallback = to ?? (user?.role === "owner" ? "/stores" : `/stores/${user?.storeId}`);

    // If there is history, go back. Otherwise, go to the fallback.
    const go = () => {
        window.history.length > 1 ? navigate(-1) : navigate(fallback);
    }

    return (
        <button
            type="button"
            onClick={go}
            className={`btn ${classStyle}`}
            >
            {label}
        </button>
    );
};