interface LoaderProps {
  className?: string;
}

export default (props: LoaderProps) => {
  return <span className={`Loader ${props.className}`}></span>;
};
