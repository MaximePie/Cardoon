import express from "express";
const router = express.Router();
import Item, { Item as ItemType } from "../models/Item.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import { ObjectId } from "mongoose";
import { uploadImage } from "../utils/imagesManager.js";
import { IncomingForm } from "formidable";

router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById((req as any).user.id);
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
  } catch (error) {
    console.error("Error fetching items:", error);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const user = await User.findById((req as any).user.id);
  if (!user) {
    res.status(404).json({ msg: "User not found" });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ msg: "Access denied" });
    return;
  }
  try {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        res.status(400).json({ msg: "Error parsing form" });
        return;
      }

      const requiredFields = [
        "name",
        "description",
        "price",
        "type",
        "effectValue",
        "effectType",
      ];

      const data = Object.fromEntries(
        requiredFields.map((k) => [k, fields[k]?.[0] ?? null])
      );

      const missing = requiredFields.find((k) => !data[k]);
      if (missing) {
        res.status(400).json({ msg: `Missing field: ${missing}` });
        return;
      }
      const {
        name,
        description,
        price: priceRaw,
        type,
        effectValue: effectValueRaw,
        effectType,
      } = data as {
        name: string;
        description: string;
        priceRaw: string;
        type: string;
        effectValueRaw: string;
        effectType: string;
      };

      const price = Number(priceRaw);
      const effectValue = Number(effectValueRaw);
      if (Number.isNaN(price) || Number.isNaN(effectValue)) {
        res.status(400).json({ msg: "Price and effectValue must be numbers" });
        return;
      }

      const validTypes = ["head", "weapon", "armor", "accessory"];
      if (!validTypes.includes(type)) {
        res.status(400).json({ msg: "Invalid item type" });
        return;
      }

      const imageFile = Array.isArray(files.imageFile)
        ? files.imageFile[0]
        : files.imageFile;

      const existingItem = await Item.findOne({
        name,
      });
      if (existingItem) {
        res.status(400).json({ msg: "Item already exists" });
        return;
      }

      if (!name || !description || !price) {
        res.status(400).json({ msg: "Please fill in all fields" });
        return;
      }

      if (!imageFile || !imageFile.filepath || !imageFile.originalFilename) {
        res.status(400).json({ msg: "Invalid image file" });
        return;
      }
form.parse(req, async (err, fields, files) => {
  if (err) {
    console.error("Error parsing form:", err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
  try {
    // … your existing validations …
    const imageLink = await uploadImage({
      filepath: imageFile.filepath,
      originalFilename: imageFile.originalFilename,
    });
    // … continue saving item and sending response …
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ msg: "Server error" });
  }
});
      const newItem = new Item({
        name,
        description,
        price,
        image: imageLink,
        effect: {
          type: effectType,
          value: effectValue,
        },
        type,
      });
      console.log(newItem);
      await newItem.save();
      res.status(200).json(newItem);
      return;
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ msg: "Server error" });
    return;
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  if ((req as any).user.role !== "admin") {
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
      await User.onItemRemoved(item._id as unknown as ObjectId);
      res.json({ msg: "Item removed" });
    } else {
      res.status(404).json({ msg: "Item not found" });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
