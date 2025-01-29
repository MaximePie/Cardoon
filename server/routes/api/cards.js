// routes/api/books.js
import express from "express";
const router = express.Router();
import Card from "../../models/Card.js";
import { clearDBAndSeed } from "../../controllers/card.js";

// @route   GET api/books/test
// @desc    Tests books route
// @access  Public
router.get("/test", (req, res) => res.send("Card route testing!"));

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", async (req, res) => {
  await clearDBAndSeed();

  const cards = await Card.find();
  const result = cards;
  res.json(cards);
});

// @route   GET api/books/:id
// @desc    Get single book by id
// @access  Public
router.get("/:id", (req, res) => {
  Card.findById(req.params.id)
    .then((card) => res.json(card))
    .catch((err) =>
      res.status(404).json({ noCardFound: "No noCardFound found" })
    );
});

// @route   POST api/books
// @desc    Add/save book
// @access  Public
router.post("/", (req, res) => {
  Card.create(req.body)
    .then((card) => res.json({ msg: "card added successfully" }))
    .catch((err) => res.status(400).json({ error: "Unable to add this card" }));
});

// @route   PUT api/books/:id
// @desc    Update book by id
// @access  Public
router.put("/:id", (req, res) => {
  Card.findByIdAndUpdate(req.params.id, req.body)
    .then((book) => res.json({ msg: "Updated successfully" }))
    .catch((err) =>
      res.status(400).json({ error: "Unable to update the Database" })
    );
});

// @route   DELETE api/books/:id
// @desc    Delete book by id
// @access  Public
router.delete("/:id", (req, res) => {
  Card.findByIdAndDelete(req.params.id)
    .then((card) => res.json({ mgs: "Card entry deleted successfully" }))
    .catch((err) => res.status(404).json({ error: "No such a card" }));
});

export default router;
