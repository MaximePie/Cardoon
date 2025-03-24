// routes/api/books.js
import express from "express";
const router = express.Router();
import Card from "../../models/Card.js";
import authMiddleware from "../../middleware/auth.js";
import User from "../../models/User.js";
import { uploadImage } from "../../utils/imagesManager.js";
import { IncomingForm } from "formidable";
import UserCard from "../../models/UserCard.js";

// @route   GET api/books/test
// @desc    Tests books route
// @access  Public
router.get("/test", (req, res) => res.send("Card route testing!"));

router.get("/categories", async (req, res) => {
  const categories = await Card.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
  ]);
  res.json(categories);
});

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", async (req, res) => {
  const cards = await Card.find();
  res.json(cards);
});

// @route   GET api/books/:id
// @desc    Get single book by id
// @access  Public
router.get("/:id", (req, res) => {
  Card.findById(req.params.id)
    .then((card) => res.json(card))
    .catch((err) =>
      res.status(404).json({ noCardFound: "No CardFound found" })
    );
});

// @route   POST api/books
// @desc    Add/save book
// @access  Public
router.post("/", authMiddleware, async (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Error parsing the files" });
    }
    try {
      const answer = fields.answer[0];
      const question = fields.question[0];
      const image = files.image ? files.image[0] : null;
      const category = fields.category ? fields.category[0] : null;
      let imageLink = fields.imageLink?.length > 0 ? fields.imageLink[0] : null;

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
        } else {
          imageLink = await uploadImage(image);
        }
      }

      const newCard = {
        question,
        answer,
        imageLink,
        category,
      };

      const createdCard = await Card.create(newCard);
      await user.attachCard(createdCard._id);

      res.json({ ...createdCard.toObject(), imageLink });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ errorMessage: "Error while creating card: " + err.message });
    }
  });
});

// @route   PUT api/books/:id
// @desc    Update book by id
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Error parsing the files" });
      }
      const answer = fields.answer[0];
      const question = fields.question[0];
      const image = files.image ? files.image[0] : null;
      const category = fields.category ? fields.category[0] : null;
      let imageLink = fields.imageLink?.length > 0 ? fields.imageLink[0] : null;

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
          imageLink = await uploadImage(image);
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
      res.json(card);
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating the card" });
  }
});

// @route   DELETE api/books/:id
// @desc    Delete book by id
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const myCard = await Card.findById(id);
    const card = await Card.findByIdAndDelete(id);
    if (!card) {
      return res.status(404).json({ error: "No such card" });
    }
    await UserCard.deleteMany({ card: card._id });
    res.json({ msg: "Card entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting the card" });
  }
});

export default router;
