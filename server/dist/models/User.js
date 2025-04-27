import mongoose from "mongoose";
import UserCard from "./UserCard.js";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
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
    items: [
        {
            base: {
                type: mongoose.Schema.Types.ObjectId,
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
});
UserSchema.methods = {
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
        const item = await mongoose.model("Item").findById(userItem.base);
        if (!item) {
            throw new Error("Item not found");
        }
        userItem.level += 1;
        this.gold -= userItem.currentCost;
        userItem.currentCost *= item.upgradeCostMultiplier || 2;
        await this.save();
        return userItem;
    },
};
UserSchema.methods.attachCard = async function (cardId) {
    const now = new Date();
    const userCard = new UserCard({
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
    return UserCard.find({ user: this._id }).populate("card");
};
UserSchema.methods.getOutdatedCards = async function () {
    const now = new Date();
    return UserCard.find({
        user: this._id,
        nextReview: { $lt: now },
    }).populate("card");
};
UserSchema.statics.createUser = async function (email, password, username) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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
    const goldEffect = this.items.reduce((acc, item) => {
        return (acc +
            (item.base.effect?.type === "gold"
                ? item.base.effect?.value * item.level || 0
                : 0));
    }, 0);
    this.gold += gold + goldEffect;
    await this.save();
};
UserSchema.methods.buyItem = async function (itemId) {
    const item = await mongoose.model("Item").findById(itemId);
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
const User = mongoose.model("User", UserSchema);
export default User;
