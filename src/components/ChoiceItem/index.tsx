import "./style.css";

type Props = {
  children?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
};

export default function ChoiceItem({ children, delay = 0, onClick }: Props) {
  return (
    <button
      className="choice-item floating-choice-item"
      style={{ animationDelay: `${-delay}s, 0s` }}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
