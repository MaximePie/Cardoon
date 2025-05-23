// routes/api/books.js
import express from "express";
const router = express.Router();
import Card from "../models/Card.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import { uploadImage } from "../utils/imagesManager.js";
import { IncomingForm } from "formidable";
import UserCard from "../models/UserCard.js";
import { ObjectId } from "mongoose";
import { Request, Response } from "express";

router.get("/categories", async (req, res) => {
  const categories = await Card.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);
  res.json(categories);
});

router.get("/", async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

router.get("/:id", (req, res) => {
  Card.findById(req.params.id)
    .then((card) => res.json(card))
    .catch((err) =>
      res.status(404).json({ noCardFound: "No CardFound found" })
    );
});

router.post("/", authMiddleware, async (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Error parsing the files" });
    }
    try {
      const answer = fields.answer?.[0] ?? null;
      const question = fields.question?.[0];
      const image = files.image ? files.image[0] : null;
      const category = fields.category ? fields.category[0] : null;
      const parentId = fields.parentId ? fields.parentId[0] : null;
      let imageLink =
        ((fields.imageLink ?? []) as string[]).length > 0
          ? (fields.imageLink as string[])[0]
          : null;

      const user = await User.findById((req as any).user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
      }

      if (!question && !image) {
        return res.status(400).json({
          error: "Question or image is required",
        });
      }

      if (!imageLink) {
        if (!files.image || files.image.length === 0) {
          imageLink = null;
        } else {
          if (image) {
            imageLink = await uploadImage({
              filepath: image.filepath,
              originalFilename: image.originalFilename ?? "default_filename",
            });
          } else {
            imageLink = null;
          }
        }
      }

      const newCard = {
        question,
        answer,
        imageLink,
        category,
        parentId,
      };

      const createdCard = await Card.create(newCard);
      await user.attachCard(createdCard._id as ObjectId);

      res.json({ ...createdCard.toObject(), imageLink });
    } catch (err) {
      console.error("Error creating card:", err);
      res.status(500).json({
        errorMessage:
          "Error while creating card: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  });
});

router.put("/:id", async (req, res) => {
  try {
    const form = new IncomingForm();
    // const [fields, files] = await form.parse(req);
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Error parsing the files" });
      }
      const answer = fields.answer?.[0] ?? null;
      const question = fields.question?.[0] ?? null;
      const image = files.image ? files.image[0] : null;
      const category = fields.category ? fields.category[0] : null;
      let imageLink =
        ((fields.imageLink ?? []) as string[]).length > 0
          ? (fields.imageLink as string[])[0]
          : null;

      if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
      }

      if (!question && !image) {
        return res.status(400).json({
          error: "Question or image is required",
        });
      }

      if (!imageLink) {
        if (!files.image || files.image.length === 0) {
          imageLink = null;
        } else {
          if (image) {
            imageLink = await uploadImage({
              filepath: image.filepath,
              originalFilename: image.originalFilename ?? "default_filename",
            });
          } else {
            imageLink = null;
          }
        }
      }

      const newCard = {
        question,
        answer,
        imageLink,
        category,
      };

      const card = await Card.findByIdAndUpdate(req.params.id, newCard, {
        new: true,
      });
      if (!card) {
        return res.status(404).json({ error: "No such card" });
      }
      res.status(200).json(card);
      return;
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating the card" });
    return;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const card = await Card.findByIdAndDelete(id);
    if (!card) {
      res.status(404).json({ error: "No such card" });
      return;
    }
    await UserCard.deleteMany({ card: card._id });
    res.json({ msg: "Card entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting the card" });
  }
});

export default router;
