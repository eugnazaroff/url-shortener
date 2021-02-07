const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model')
const router = Router()

const config = require('config')

router.post(
    '/register',
    [
        check('email', 'wrong email').isEmail,
        check('password', 'password must be 6 six or greater').isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong registration data',
                })
            }
            const { email, password } = req.body
            const candidate = await User.findOne({ email, password })
            if (candidate) {
                return res.status(400).json({
                    message: 'There is user with same e-mail',
                })
            }
            const hashedPassword = await bcrypt.hash(password, 12)
            const newUser = new User({ email, password: hashedPassword })
            await newUser.save()
            console.log('Saved')
            res.status(201).json({ message: 'User created!' })
        } catch (error) {
            console.log(error)
        }
    }
)

router.get(
    '/login',
    [
        check('email', 'wrong email').normalizeEmail().isEmail,
        check('password', 'enter password').exists(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong login data',
                })
            }
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({
                    message: 'No such user',
                })
            }
            const isMatch = bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Wrong password',
                })
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                },
                config.get('jwtSecret'),
                {
                    expiresIn: '1h',
                }
            )
            res.json({ token, userId: user.id })
        } catch (error) {
            console.log(error)
        }
    }
)

module.exports = router
