import mongoose from "mongoose";
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
const Card = mongoose.model("Card", CardSchema);
export default Card;
