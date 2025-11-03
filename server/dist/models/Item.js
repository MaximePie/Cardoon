"use strict";
// Users can buy items in the shop and use them in the game
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ItemSchema = new mongoose_1.default.Schema({
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
const ItemModel = mongoose_1.default.model("Item", ItemSchema);
exports.default = ItemModel;
