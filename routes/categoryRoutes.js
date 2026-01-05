const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const categoryController = require("../controllers/category.controller");

// 🔐 Protected routes
router.get("/", auth, categoryController.index);
router.get("/parents/", auth, categoryController.parentCategories);
router.get("/parents/:id", auth, categoryController.parentCategories);
router.post("/", auth, upload.single("image"), categoryController.store);
router.get("/:id", auth, categoryController.show);
router.put("/:id", auth, upload.single("image"), categoryController.update);
router.delete("/:id", auth, categoryController.destroy);
module.exports = router;