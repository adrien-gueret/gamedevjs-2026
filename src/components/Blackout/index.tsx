import "./style.css";

type Props = {
  children?: React.ReactNode;
};

export default function Blackout({ children }: Props) {
  return <div className="blackout">{children}</div>;
}
