// Users can buy items in the shop and use them in the game
import mongoose from "mongoose";
const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    type: {
        type: String,
        enum: ["head", "weapon", "armor", "accessory"],
        required: true,
    },
    effect: {
        type: { type: String, enum: ["gold"], required: true },
        value: { type: Number, required: true },
    },
    upgradeCostMultiplier: { type: Number, default: 2 },
});
const ItemModel = mongoose.model("Item", ItemSchema);
export default ItemModel;
