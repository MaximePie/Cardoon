import express from "express";
const router = express.Router();
import Item from "../models/Item.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
router.get("/", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    if (user.role !== "admin") {
        res.status(403).json({ msg: "Access denied" });
        return;
    }
    try {
        const items = await Item.find();
        res.status(200).json(items);
    }
    catch (error) {
        console.error("Error fetching items:", error);
    }
});
router.post("/", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
    }
    if (user.role !== "admin") {
        res.status(403).json({ msg: "Access denied" });
        return;
    }
    try {
        const { name, description, price, image } = req.body;
        const existingItem = await Item.findOne({
            name,
        });
        if (existingItem) {
            res.status(400).json({ msg: "Item already exists" });
        }
        if (!name || !description || !price || !image) {
            res.status(400).json({ msg: "Please fill in all fields" });
        }
        const newItem = new Item({
            name,
            description,
            price,
            image,
            effect: {
                type: "gold",
                value: 1,
            },
            type: "accessory",
        });
        await newItem.save();
        res.status(200).json(newItem);
        return;
    }
    catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ msg: "Server error" });
        return;
    }
});
router.delete("/:id", authMiddleware, async (req, res) => {
    if (req.user.role !== "admin") {
        res.status(403).json({ msg: "Access denied" });
    }
    try {
        const item = await Item.findOneAndDelete({
            _id: req.params.id,
        });
        if (item) {
            const { _id } = item;
            if (_id) {
                res.status(404).json({ msg: "Item not found" });
            }
            await User.onItemRemoved(item._id);
            res.json({ msg: "Item removed" });
        }
        else {
            res.status(404).json({ msg: "Item not found" });
        }
    }
    catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ msg: "Server error" });
    }
});
export default router;
