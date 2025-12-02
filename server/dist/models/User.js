"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const DailyGoal_js_1 = __importDefault(require("./DailyGoal.js"));
const UserCard_js_1 = __importDefault(require("./UserCard.js"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    correctAnswers: {
        type: Number,
        default: 0,
    },
    wrongAnswers: {
        type: Number,
        default: 0,
    },
    answersRatio: {
        type: Number,
        default: 0,
    },
    gold: {
        // Possession of gold coins
        type: Number,
        default: 0,
    },
    dailyGoal: {
        type: Number,
        default: 0,
        min: [0, "Daily goal must be a positive number"],
    },
    currentGoldMultiplier: {
        type: Number,
        default: 1,
    },
    currentDailyGoal: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "DailyGoal",
    },
    streak: {
        type: Number,
        default: 0,
    },
    items: [
        {
            base: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Item",
                required: true,
            },
            level: {
                type: Number,
                default: 1,
            },
            currentCost: {
                type: Number,
                default: 0,
            },
        },
    ],
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    image: {
        type: String,
        required: false, // Profile image is optional
    },
    hero: {
        attackDamage: {
            type: Number,
            default: 1,
        },
        regenerationRate: {
            type: Number,
            default: 1,
        },
        maxHealth: {
            type: Number,
            default: 20,
        },
        currentHealth: {
            type: Number,
            default: 20,
        },
        level: {
            type: Number,
            default: 1,
        },
        experience: {
            type: Number,
            default: 0,
        },
        experienceToNextLevel: {
            type: Number,
            default: 100,
        },
    },
});
UserSchema.methods = {
    updateDailyGoal: async function (target) {
        if (target === undefined ||
            target === null ||
            target < 0 ||
            isNaN(target)) {
            throw new Error("Target is required");
        }
        this.dailyGoal = target;
        await this.save();
        return this.dailyGoal;
    },
    getGoldMultiplier: async function () {
        await this.populate("items.base");
        return this.items.reduce((acc, item) => {
            if (item.base.effect.type === "gold") {
                return acc + item.base.effect.value * item.level || 0;
            }
            return acc;
        }, 1);
    },
    upgradeItem: async function (itemId) {
        const userItem = this.items.find((item) => item.base.toString() === itemId.toString());
        if (!userItem) {
            throw new Error("Item not found in user's items");
        }
        if (this.gold < userItem.currentCost) {
            throw new Error("Not enough gold to upgrade item");
        }
        const item = await mongoose_1.default.model("Item").findById(userItem.base);
        if (!item) {
            throw new Error("Item not found");
        }
        userItem.level += 1;
        this.gold -= userItem.currentCost;
        userItem.currentCost *= item.upgradeCostMultiplier || 2;
        this.currentGoldMultiplier = await this.getGoldMultiplier();
        await this.save();
        return userItem;
    },
    buyItem: async function (itemId) {
        try {
            const item = await mongoose_1.default.model("Item").findById(itemId);
            if (!item) {
                throw new Error("Item not found");
            }
            if (this.gold < item.price) {
                throw new Error("Not enough gold");
            }
            this.items.push({
                base: itemId,
                level: 1,
                currentCost: item.price * (item.upgradeCostMultiplier || 2),
            });
            this.gold -= item.price;
            this.currentGoldMultiplier = await this.getGoldMultiplier();
            await this.save();
        }
        catch (error) {
            console.error("Error buying item:", error);
            throw error;
        }
    },
    // If daily goal does not exist, create it
    createDailyGoal: async function (target, date) {
        if (!target || !date) {
            console.error("Target and date are required");
            return null;
        }
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        // Upsert (find or create) a daily goal for the given date and user
        const dailyGoal = await DailyGoal_js_1.default.findOneAndUpdate({
            userId: this._id,
            date: { $gte: startOfDay, $lte: endOfDay },
        }, {
            $setOnInsert: {
                userId: this._id,
                target,
                date,
                progress: 0,
                status: "PENDING",
                closedAt: null,
            },
        }, { new: true, upsert: true });
        this.currentDailyGoal = dailyGoal._id;
        await this.save();
        return dailyGoal;
    },
    // Return true if the daily goal is completed
    increaseDailyGoalProgress: async function (increment) {
        if (!this.currentDailyGoal) {
            throw new Error("No current daily goal found");
        }
        const dailyGoal = await DailyGoal_js_1.default.findById(this.currentDailyGoal);
        if (!dailyGoal) {
            throw new Error("Daily goal not found");
        }
        dailyGoal.progress += increment;
        if (dailyGoal.progress >= dailyGoal.target &&
            dailyGoal.status !== "COMPLETED") {
            dailyGoal.status = "COMPLETED";
            dailyGoal.closedAt = new Date();
            const currentGoldMultiplier = await this.getGoldMultiplier();
            this.streak += 1;
            const goldReward = 10 * currentGoldMultiplier * this.streak * dailyGoal.target;
            this.gold += goldReward;
            await this.save();
        }
        await dailyGoal.save();
    },
    // It receives a % bonnus and applies the max between amount% and 0.1 flat bonus
    addBonus: async function (type, amount) {
        if (type === "attack") {
            this.hero.attackDamage += Math.max((this.hero.attackDamage * amount) / 100, 0.1);
        }
        else if (type === "hp") {
            this.hero.maxHealth += Math.max((this.hero.maxHealth * amount) / 100, 0.1);
            this.hero.currentHealth += Math.max((this.hero.currentHealth * amount) / 100, 0.1);
        }
        else if (type === "regeneration") {
            this.hero.regenerationRate += Math.max((this.hero.regenerationRate * amount) / 100, 0.1);
        }
        await this.save();
    },
};
UserSchema.methods.attachCard = async function (cardId) {
    const now = new Date();
    const userCard = new UserCard_js_1.default({
        user: this._id,
        card: cardId,
        interval: 5,
        lastReviewed: now,
        nextReview: now.getTime() + 5 * 1000,
    });
    await userCard.save();
    return userCard;
};
UserSchema.methods.getCards = async function () {
    return UserCard_js_1.default.find({ user: this._id }).populate("card");
};
UserSchema.methods.getOutdatedCards = async function () {
    const now = new Date();
    return UserCard_js_1.default.find({
        user: this._id,
        nextReview: { $lt: now },
    }).populate("card");
};
UserSchema.statics.createUser = async function (email, password, username) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    return this.create({ username, password: hashedPassword, email });
};
UserSchema.statics.getUserByUsername = async function (username) {
    return this.findOne({ username });
};
UserSchema.statics.getUserByEmail = async function (email) {
    return this.findOne({ email });
};
UserSchema.methods.addScore = async function (interval) {
    const newScore = this.score + interval;
    this.score = newScore;
    await this.save();
};
UserSchema.methods.updateAnswerRatio = async function (isCorrectAnswer) {
    if (this.correctAnswers === undefined) {
        this.correctAnswers = 0;
    }
    if (this.wrongAnswers === undefined) {
        this.wrongAnswers = 0;
    }
    if (this.answersRatio === undefined) {
        this.answersRatio = 0.5;
    }
    if (isCorrectAnswer) {
        this.correctAnswers++;
    }
    else {
        this.wrongAnswers++;
    }
    this.answersRatio =
        this.correctAnswers / (this.correctAnswers + this.wrongAnswers);
    await this.save();
    return this.answersRatio;
};
UserSchema.methods.spendGold = async function (gold) {
    this.gold -= gold;
    await this.save();
};
UserSchema.methods.earnGold = async function (gold) {
    await this.populate("items.base");
    this.gold += await this.currentGoldMultiplier;
    await this.save();
};
UserSchema.methods.removeItem = async function (itemId) {
    const itemIndex = this.items.findIndex((item) => item.base.toString() === itemId.toString());
    if (itemIndex > -1) {
        this.items.splice(itemIndex, 1);
        await this.save();
    }
    else {
        throw new Error("Item not found in user's items");
    }
};
UserSchema.statics.onItemRemoved = async function (itemId) {
    await this.updateMany({ items: itemId }, { $pull: { items: itemId } });
};
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
