import type React from "react";
import "./style.css";

type Props = {
  name: React.ReactNode;
  details: React.ReactNode;
};

export default function CharacterDescription({ name, details }: Props) {
  return (
    <div className="character-description-container">
      <div className="character-description-name">{name}</div>
      <p className="character-description-details">{details}</p>
    </div>
  );
}
