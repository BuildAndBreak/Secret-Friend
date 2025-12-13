import { capitalizeFirstLetter } from "../../../utils/capitalize";
import { Users } from "lucide-react";
import "./Members.css";

export default function Members({ data }) {
  return (
    <section className="card members-card">
      <h3 className="card-title">
        <Users size={20} /> Group Members
      </h3>

      <ol className="members-list">
        {data.participants?.map((m) => (
          <li key={m.id}>{capitalizeFirstLetter(m.name)}</li>
        ))}
      </ol>
    </section>
  );
}
