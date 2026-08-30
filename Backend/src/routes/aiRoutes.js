import express from "express";
import { getMeetingSummary } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summary", getMeetingSummary);

export default router;