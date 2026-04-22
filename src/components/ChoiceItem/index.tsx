import "./style.css";

type Props = {
  children?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default function ChoiceItem({
  children,
  delay = 0,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <button
      className="choice-item floating-choice-item"
      style={{ animationDelay: `${-delay}s, 0s` }}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  );
}
