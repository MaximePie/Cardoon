interface ExpBarProps {
  currentExp: number;
  maxExp?: number;
}

export const ExpBar = ({ currentExp, maxExp = 1000 }: ExpBarProps) => {
  const progressPercentage = Math.min((currentExp / maxExp) * 100, 100);

  return (
    <div className="ExpBar">
      <div
        className="ExpBar__fill"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};
