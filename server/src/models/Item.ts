// Users can buy items in the shop and use them in the game

import mongoose from "mongoose";

type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  type: "head" | "weapon" | "armor" | "accessory";
  effect: {
    type: "gold";
    value: number;
  };
};

const ItemSchema = new mongoose.Schema<Item>({
  id: { type: Number, required: true },
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
});

const ItemModel = mongoose.model<Item>("Item", ItemSchema);

export default ItemModel;
export type { Item };
