const Category = require("../models/Category");
const slugify = require("slugify");

/**
 * GET /api/categories?page=1&limit=10
 */
exports.index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Category.countDocuments();

        const categories = await Category.find()
            .sort({ parent_id: 1, name: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            data: categories,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/categories
 */
exports.store = async (req, res) => {
    try {
        const { name, parent_id, status } = req.body;

        const data = {
            name,
            slug: slugify(name, { lower: true }),
            parent_id: parent_id || null,
            status: status ?? true,
        };

        if (req.file) {
            data.image = `/uploads/${req.file.filename}`;
        }

        const category = await Category.create(data);
        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/categories/:id
 */
exports.show = async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
};

/**
 * PUT /api/categories/:id
 */
exports.update = async (req, res) => {
    const { name, parent_id, status } = req.body;

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name,
            slug: slugify(name, { lower: true }),
            parent_id: parent_id || null,
            status,
        },
        { new: true }
    );

    res.json({
        message: "Category updated successfully",
        data: category,
    });
};

/**
 * DELETE /api/categories/:id
 */
exports.destroy = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
};
