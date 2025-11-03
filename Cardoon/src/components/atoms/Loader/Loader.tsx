interface LoaderProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

export default function Loader(props: LoaderProps) {
  return (
    <div role="status" aria-live="polite">
      <span
        className={`Loader ${props.className || ""} Loader--${props.size || "medium"}`.trim()}
      ></span>
    </div>
  );
}
