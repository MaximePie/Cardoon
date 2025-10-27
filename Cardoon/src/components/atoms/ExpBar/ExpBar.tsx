// 🧩 Composant ExpBar pour la barre d'expérience
interface ExpBarProps {
  currentExp: number;
  maxExp?: number;
}
// 🎯 Constants pour éviter la duplication et améliorer la lisibilité
const EXP_FOR_NEXT_LEVEL = 5000;

export default function ExpBar({
  currentExp,
  maxExp = EXP_FOR_NEXT_LEVEL,
}: ExpBarProps) {
  const progressPercentage = Math.min((currentExp / maxExp) * 100, 100);

  return (
    <div className="ExpBar">
      <div
        className="ExpBar__fill"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
}
