import "./style.css";

type Props = {
  children: React.ReactNode;
};

export default function Screen({ children }: Props) {
  return <div className="screen">{children}</div>;
}
