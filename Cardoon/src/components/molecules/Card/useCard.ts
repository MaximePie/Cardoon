import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { PopulatedUserCard } from "../../../types/common";
// ✅ Version optimisée avec mise en cache
const colorCache = new Map<string, string>();

const stringToRgb = (text: string): string => {
  if (!text) return "rgb(240, 240, 240)"; // Couleur par défaut

  if (colorCache.has(text)) {
    return colorCache.get(text)!;
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash; // Plus rapide que |= 0
  }

  // Utilisation de bitwise operations plus claires
  const r = Math.round(((hash >> 16) & 255) * 0.4 + 153); // 0.4 * couleur + 60% blanc
  const g = Math.round(((hash >> 8) & 255) * 0.4 + 153);
  const b = Math.round((hash & 255) * 0.4 + 153);

  const color = `rgb(${r}, ${g}, ${b})`;
  colorCache.set(text, color);
  return color;
};
export default function useCard(
  card: PopulatedUserCard,
  onAnswer: (card: PopulatedUserCard, isCorrect: boolean) => void,
  isFlashModeOn: boolean
) {
  const {
    card: { question, answer, imageLink, category, expectedAnswers },
    _id: userCardId,
    interval,
  } = card;
  const [isRecto, flipCard] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const cardClassNames = classNames("Card", {
    "Card--verso": !isRecto,
    "Card--isFlipping": isFlipping,
  });
  const cardBackground = `linear-gradient(  
  130deg,  
  ${stringToRgb(category || "")},  
  #ffffff  
)`;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // If recto, set to false, else do nothing
  const onCardClick = () => {
    if (isRecto) {
      if (isFlashModeOn) {
        succeed();
      } else {
        setIsFlipping(true);
        flipCard(false);
        timeoutRef.current = setTimeout(() => {
          setShowAnswer(true);
          setIsFlipping(false);
        }, 200);
      }
    }
  };

  const succeed = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    onAnswer(card, true);
  };

  const fail = () => {
    onAnswer(card, false);
  };

  return {
    cardClassNames,
    cardBackground,
    onCardClick,
    succeed,
    fail,
    isRecto,
    showAnswer,
    userCardId,
    question,
    answer,
    imageLink,
    category,
    expectedAnswers,
    interval,
  };
}
