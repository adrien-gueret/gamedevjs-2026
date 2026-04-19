import "./style.css";

type Props = {
  children?: React.ReactNode;
  type: "battle" | "devil";
};

export default function Scene({ children, type }: Props) {
  return (
    <div
      className="scene"
      style={{
        backgroundImage: `url(./images/scenes/${type}.png)`,
      }}
    >
      {children}
    </div>
  );
}
