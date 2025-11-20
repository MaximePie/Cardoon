import FavoriteIcon from "@mui/icons-material/Favorite";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { AnimatePresence, motion } from "motion/react";
import adventureBackground from "../../../assets/adventure-background.svg";
import heroAttack from "../../../assets/Hero/attack1.gif";
import devMode from "../../../assets/Hero/devmode.svg";
import heroIdle from "../../../assets/Hero/idle.gif";
import { PopulatedUserCard } from "../../../types/common";
import ExpBar from "../../atoms/ExpBar/ExpBar";
import Card from "../../molecules/Card/Card";
import { getEnemyAssets } from "./enemyAssets";
import useAdventure from "./useAdventure";
const isDev = import.meta.env.DEV;
const AdventurePage = () => {
  const { cardsInHand, hero, heroState, enemyState, currentEnemy, removeCard } =
    useAdventure();

  const enemyAssets = getEnemyAssets(currentEnemy.id);
  const BonusIcon = currentEnemy.bonus.icon;

  return (
    <div>
      <div className="AdventurePage__profile">
        <div className="AdventurePage__stats">
          <div className="AdventurePage__stats-resources">
            <span>
              <WhatshotIcon color="error" fontSize="small" />{" "}
              {hero.attackDamage}
            </span>
            <span>
              <HealthAndSafetyIcon color="warning" fontSize="small" />{" "}
              {hero.regenerationRate}
            </span>
            <span>
              <FavoriteIcon color="success" fontSize="small" /> {hero.maxHealth}
            </span>
            <span>
              <StarBorderPurple500Icon color="warning" fontSize="small" />{" "}
              {hero.level}
            </span>
          </div>
          <div className="AdventurePage__stats-level">
            <p>Forêt toxique - Niveau 1</p>
          </div>
          <div className="AdventurePage__stats-expBar">
            <ExpBar
              currentExp={hero.experience}
              maxExp={hero.experienceToNextLevel}
            />
          </div>
        </div>
      </div>
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
              {hero.name}
              <span className="AdventurePage__status">
                {isDev && <img src={devMode} alt="Dev Mode" />}
              </span>
            </p>
            <div className="AdventurePage__healthBar">
              <span className="AdventurePage__healthText">
                {hero.currentHealth} / {hero.maxHealth}
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
            <img
              src={
                enemyState === "idle" ? enemyAssets.idle : enemyAssets.defeated
              }
              alt={currentEnemy.name}
              className="AdventurePage__characterImage"
            />
            <p className="AdventurePage__name">
              {currentEnemy.name}
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
            </p>
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
