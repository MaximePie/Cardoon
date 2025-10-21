// routes/api/books.js
import express from "express";
import { IncomingForm } from "formidable";
import mongoose from "mongoose";
import authMiddleware from "../middleware/auth.js";
import Card from "../models/Card.js";
import User from "../models/User.js";
import UserCard from "../models/UserCard.js";
import { uploadImage } from "../utils/imagesManager.js";
const router = express.Router();
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
        .catch((err) => res.status(404).json({ noCardFound: "No CardFound found" }));
});
router.post("/invert", authMiddleware, async (req, res) => {
    try {
        const { cardId } = req.body;
        if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
            res.status(400).json({ error: "Invalid or missing cardId" });
            return;
        }
        const originalCard = await Card.findById(cardId);
        if (!originalCard) {
            res.status(404).json({ error: "Original card not found" });
            return;
        }
        const invertedCard = await originalCard.invert();
        res.status(201).json({ originalCard, invertedCard });
        return;
    }
    catch (err) {
        console.error("Error inverting card:", err);
    }
    res.status(501).json({ error: "Error inverting card" });
    return;
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
            const expectedAnswers = fields.expectedAnswers
                ? Array.isArray(fields.expectedAnswers)
                    ? fields.expectedAnswers
                    : [fields.expectedAnswers]
                : [];
            let imageLink = (fields.imageLink ?? []).length > 0
                ? fields.imageLink[0]
                : null;
            const user = await User.findById(req.user.id);
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
                }
                else {
                    if (image) {
                        imageLink = await uploadImage({
                            filepath: image.filepath,
                            originalFilename: image.originalFilename ?? "default_filename",
                        });
                    }
                    else {
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
                expectedAnswers,
            };
            const createdCard = await Card.create(newCard);
            await user.attachCard(createdCard._id);
            res.json({ ...createdCard.toObject(), imageLink });
        }
        catch (err) {
            console.error("Error creating card:", err);
            res.status(500).json({
                errorMessage: "Error while creating card: " +
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
            let imageLink = (fields.imageLink ?? []).length > 0
                ? fields.imageLink[0]
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
                }
                else {
                    if (image) {
                        imageLink = await uploadImage({
                            filepath: image.filepath,
                            originalFilename: image.originalFilename ?? "default_filename",
                        });
                    }
                    else {
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
    }
    catch (err) {
        res.status(500).json({ error: "Error updating the card" });
        return;
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const card = await Card.findByIdAndDelete(id);
        if (!card) {
            res.status(404).json({ error: "No such card" });
            return;
        }
        await UserCard.deleteMany({ card: card._id });
        res.json({ msg: "Card entry deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Error deleting the card" });
    }
});
export default router;
