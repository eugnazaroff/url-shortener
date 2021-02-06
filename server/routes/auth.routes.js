const { Router } = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model')
const router = Router()

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

router.get('/login', (req, res) => {
    res.send('<h1>Hello from login</h1>')
})

module.exports = router
