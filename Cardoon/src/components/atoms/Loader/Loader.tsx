interface LoaderProps {
  className?: string;
}

export default function Loader(props: LoaderProps) {
  return <span className={`Loader ${props.className}`}></span>;
}
