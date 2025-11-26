import { AnimatePresence, motion } from "motion/react";
import adventureBackground from "../../../assets/adventure-background.svg";
import heroAttack from "../../../assets/Hero/attack1.gif";
import devMode from "../../../assets/Hero/devmode.svg";
import heroIdle from "../../../assets/Hero/idle.gif";
import { PopulatedUserCard } from "../../../types/common";
import Card from "../../molecules/Card/Card";
import { getEnemyAssets } from "./enemyAssets";
import { HeroStats } from "./HeroStats";
import useAdventureGame from "./useAdventure";

const isDev = import.meta.env.DEV;

const AdventurePage = () => {
  const {
    cardsInHand,
    hero,
    heroState,
    enemyState,
    currentEnemy,
    removeCard,
    bonusAnimation,
    showDamageAnimation,
    damageAnimationKey,
  } = useAdventureGame();

  if (!currentEnemy) {
    return <div>Loading...</div>;
  }

  const enemyAssets = getEnemyAssets(currentEnemy.id);
  const enemyFinalDamage = currentEnemy.attackDamage - hero.defense;
  let enemyCurrentAsset;
  if (!enemyAssets) {
    enemyCurrentAsset = undefined;
  } else {
    switch (enemyState) {
      case "idle":
        enemyCurrentAsset = enemyAssets.idle;
        break;
      case "defeated":
        enemyCurrentAsset = enemyAssets.defeated;
        break;
      case "attacking":
        enemyCurrentAsset = enemyAssets.attack;
        break;
      default:
        enemyCurrentAsset = enemyAssets.idle;
    }
  }
  const BonusIcon = currentEnemy.bonus.icon;

  return (
    <div>
      <HeroStats
        attackDamage={hero.attackDamage}
        regenerationRate={hero.regenerationRate}
        maxHealth={hero.maxHealth}
        bonusAnimation={bonusAnimation}
      />
      <div className="AdventurePage__body">
        <div
          className="AdventurePage__background"
          style={{ backgroundImage: `url(${adventureBackground})` }}
        ></div>
        <div className="AdventurePage__characters">
          <motion.div
            className="AdventurePage__Hero"
            initial="idle"
            animate={heroState}
            variants={{
              attacking: { x: [0, 30, 0], transition: { duration: 0.3 } },
              idle: { x: 0 },
            }}
            transition={{ ease: "easeInOut" }}
          >
            <img
              src={heroState === "idle" ? heroIdle : heroAttack}
              alt="Hero Avatar"
              className="AdventurePage__characterImage"
            />
            <p className="AdventurePage__name">
              <span className="AdventurePage__status">
                {isDev && <img src={devMode} alt="Dev Mode" />}
              </span>
            </p>
            <AnimatePresence>
              {showDamageAnimation && (
                <motion.span
                  key={`damage-${damageAnimationKey}`} // ✅ Key unique pour forcer une nouvelle animation
                  className="AdventurePage__bonusIcon"
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 15, -15, 0],
                    y: [-10, -20, -10],
                    opacity: [0, 1, 1, 0],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: "30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    -{enemyFinalDamage}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
            <div className="AdventurePage__healthBar">
              <span className="AdventurePage__healthText">
                {Math.round(hero.currentHealth)} / {hero.maxHealth}
              </span>
              <div
                className="AdventurePage__healthBar__fill"
                style={{
                  width: `${(hero.currentHealth / hero.maxHealth) * 100}%`,
                }}
              ></div>
            </div>
          </motion.div>
          <div className="AdventurePage__Enemy">
            {enemyCurrentAsset ? (
              <img
                src={enemyCurrentAsset}
                alt={currentEnemy.name}
                className="AdventurePage__characterImage"
              />
            ) : (
              <div className="AdventurePage__characterImage">Loading...</div>
            )}
            <span className="AdventurePage__details">
              <span className="AdventurePage__name">{currentEnemy.name}</span>
              <span className="AdventurePage__bonusType">
                (+{currentEnemy.bonus.amount}
                {BonusIcon && (
                  <BonusIcon
                    className=""
                    color={currentEnemy.bonus.iconColor}
                  />
                )}
                )
              </span>
            </span>
            <div className="AdventurePage__healthBar">
              <span className="AdventurePage__healthText">
                {currentEnemy.currentHealth} / {currentEnemy.maxHealth}
              </span>
              <div
                className="AdventurePage__healthBar__fill"
                style={{
                  width: `${(currentEnemy.currentHealth / currentEnemy.maxHealth) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="AdventurePage__Cards">
          <AnimatePresence mode="popLayout">
            {cardsInHand.map((userCard: PopulatedUserCard) => (
              <Card
                key={userCard._id}
                card={userCard}
                onUpdate={removeCard}
                isFlashModeOn={false}
                onEditClick={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdventurePage;
