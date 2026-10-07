// src/components/Card.tsx
// Reusable store card for the owner's dashboard (DaisyUI card).
// Click saves the temporal store and navigates to its hub.
import { useNavigate } from "react-router";
import { useUser } from "../context/UserContext";
import type { CardProps } from "../types";
import { BTN_ERROR_OUTLINE, BTN_PRIMARY_OUTLINE } from "../constants/ui";

export const Card = ({ store, onSelect, onDelete }: CardProps) => {
  const navigate = useNavigate();
  const { setSelectedStoreId } = useUser();

  // Click: save temporal store for owner navbar links, then open the hub.
  const handleClick = () => {
    setSelectedStoreId(store._id);
    onSelect?.(store._id);
    navigate(`/stores/${store._id}`);
  };

  // Delete must not trigger the card navigation.
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(store);
  };

  return (
    <div
      className="card bg-base-100 w-96 shadow-sm cursor-pointer"
      onClick={handleClick}
    >
      <figure className="grid h-32 place-items-center bg-neutral text-4xl text-neutral-content">
        {store.name.charAt(0).toUpperCase()}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{store.name}</h2>
        <p>
          {store.streetAddress}, {store.city}
        </p>
        <div className="card-actions justify-between">
          <button
            type="button"
            className={BTN_ERROR_OUTLINE}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            type="button"
            className={BTN_PRIMARY_OUTLINE}
            onClick={handleClick}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};
