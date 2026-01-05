const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

exports.register = async (req, res) => {
    try {

        const registerValidation = [
            body("name").notEmpty().withMessage("Name is required"),
            body("email").isEmail().withMessage("Valid email is required"),
            body("password")
                .isLength({ min: 6 })
                .withMessage("Password must be at least 6 characters"),
        ];
        await Promise.all(registerValidation.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ message: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'client',
        });

        res.status(200).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'client',
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const loginValidation = [
            body("email").isEmail().withMessage("Valid email is required"),
            body("password")
                .isLength({ min: 6 })
                .withMessage("Password must be at least 6 characters"),
        ];
        await Promise.all(loginValidation.map((validation) => validation.run(req)));

       
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ message: errors.array()[0].msg });
        }
        
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).json({
                message: "Invalid credentials",
            });
        }

       


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(422).json({
                message: "Invalid credentials",
            });
        }


        const token = jwt.sign(
             {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        console.log("Generated JWT Token:", token);

        res.status(200).json({
            message: "Login successful",
            token,
            user: user,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};