import "./style.css";

type Props = {
  children: React.ReactNode;
};

export default function ReplacementBonusModal({ children }: Props) {
  return <div className="replacement-bonus-modal">{children}</div>;
}
