interface LoaderProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

export default function Loader(props: LoaderProps) {
  return (
    <span
      className={`Loader ${props.className || ""} Loader--${props.size || "medium"}`.trim()}
    ></span>
  );
}
