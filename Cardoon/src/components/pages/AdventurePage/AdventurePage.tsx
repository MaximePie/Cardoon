import FavoriteIcon from "@mui/icons-material/Favorite";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { motion } from "motion/react";
import adventureBackground from "../../../assets/adventure-background.svg";
import enemyDefeated from "../../../assets/Enemies/NightBorne_death..gif";
import enemyIdle from "../../../assets/Enemies/NightBorne_idle.gif";
import heroAttack from "../../../assets/Hero/attack1.gif";
import devMode from "../../../assets/Hero/devmode.svg";
import heroIdle from "../../../assets/Hero/idle.gif";
import { PopulatedUserCard } from "../../../types/common";
import ExpBar from "../../atoms/ExpBar/ExpBar";
import Card from "../../molecules/Card/Card";
import useAdventure from "./useAdventure";

const AdventurePage = () => {
  const { cardsInHand, hero, heroState, enemyState, currentEnemy, removeCard } =
    useAdventure();

  return (
    <div>
      <div className="AdventurePage__profile">
        <div className="AdventurePage__stats">
          <div className="AdventurePage__stats-resources">
            <span>
              <FavoriteIcon color="error" fontSize="small" />{" "}
              {hero.currentHealth} / {hero.maxHealth}
            </span>
            <span>
              <WhatshotIcon color="error" fontSize="small" />{" "}
              {hero.attackDamage}
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
            <p>{hero.name}</p>
            <p>
              HP: {hero.currentHealth} / {hero.maxHealth}{" "}
              <span className="AdventurePage__status">
                {devMode && <img src={devMode} alt="Dev Mode" />}
              </span>
            </p>
            <div className="AdventurePage__healthBar">
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
              src={enemyState === "idle" ? enemyIdle : enemyDefeated}
              alt="Idle Enemy"
              className="AdventurePage__characterImage"
            />
            <p>{currentEnemy.name}</p>
            <p>
              HP: {currentEnemy.currentHealth} / {currentEnemy.maxHealth}
            </p>
            <div className="AdventurePage__healthBar">
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
          {cardsInHand.map((userCard: PopulatedUserCard) => (
            <Card
              key={userCard._id}
              card={userCard}
              onUpdate={removeCard}
              isFlashModeOn={false}
              onEditClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdventurePage;
