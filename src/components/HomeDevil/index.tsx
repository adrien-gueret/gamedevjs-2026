import { useState } from "react";

import "./style.css";

export default function HomeDevil({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isAppearing, setIsAppearing] = useState(false);

  return (
    <div className="home-devil">
      <div
        className="home-devil-content"
        onMouseEnter={() => setIsAppearing(true)}
        onMouseLeave={() => setIsAppearing(false)}
      >
        {children}
      </div>
      <div
        className={`home-devil-image ${isAppearing ? "is-appearing" : ""}`}
      />
    </div>
  );
}
