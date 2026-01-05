const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        image: {
            type: String, // store image URL or filename
            default: null,
        },

        parent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        status: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);


categorySchema.virtual("image_url").get(function () {
    if (!this.image) return null;

    const baseUrl = process.env.APP_URL || "http://localhost:5000";
    return `${baseUrl}${this.image}`;
});

module.exports = mongoose.model("Category", categorySchema);