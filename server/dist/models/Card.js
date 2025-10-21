import mongoose from "mongoose";
import UserCard from "./UserCard";
import User from "./User";
const CardSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    imageLink: {
        type: String,
    },
    category: {
        type: String,
    },
    parentId: {
        type: String,
    },
    expectedAnswers: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    ownedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    isInverted: {
        type: Boolean,
        default: false,
    },
    hasInvertedChild: {
        type: Boolean,
        default: false,
    },
    originalCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
        default: null,
    },
});
CardSchema.statics.getCategories = async function () {
    const categories = await this.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);
    return categories;
};
CardSchema.methods.getChildren = async function () {
    const children = await this.model("Card").find({ parentId: this._id });
    return children;
};
CardSchema.methods.invert = async function () {
    let owner = await User.findById(this.ownedBy);
    if (!owner) {
        const userCard = await UserCard.findOne({ card: this._id });
        if (userCard) {
            const user = await User.findById(userCard.user);
            console.log("Found user by searching UserCards:", user);
            if (user) {
                owner = user;
            }
        }
        else {
            console.error("No UserCard found for card:", this._id);
        }
    }
    if (!owner) {
        throw new Error("No owner found for the original card");
    }
    const invertedCard = new Card({
        ...this.toObject(),
        question: this.answer,
        answer: this.question,
        isInverted: true,
        originalCardId: this._id,
        ownedBy: owner._id,
        _id: new mongoose.Types.ObjectId(), // Create a new ID for the inverted card
    });
    const card = await invertedCard.save();
    // this.hasInvertedChild = true;
    // await this.save();
    if (!card) {
        throw new Error("Error creating inverted card");
    }
    if (owner) {
        owner.attachCard(card._id);
    }
    else {
        console.warn("No owner found for the original card:", this._id, "Trying to find user by searching UserCards having this card");
        const userCard = await UserCard.findOne({ card: this._id });
        if (userCard) {
            const user = await User.findById(userCard.user);
            if (user) {
                user.attachCard(card._id);
            }
        }
        else {
            console.error("No UserCard found for card:", this._id);
        }
    }
    return card;
};
const Card = mongoose.model("Card", CardSchema);
export default Card;
