import "./style.css";

type Props = {
  children?: React.ReactNode;
  delay?: number;
};

export default function ChoiceItem({ children, delay = 0 }: Props) {
  return (
    <div
      className="choice-item floating-choice-item"
      style={{ animationDelay: `${-delay}s, 0s` }}
    >
      {children}
    </div>
  );
}
