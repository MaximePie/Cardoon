// app.js
import express from "express";
import connectDB from "./config/db.js";
import routes from "./routes/api/cards.js";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/cards", routes);
connectDB();

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
