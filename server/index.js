const express = require('express')
const mongoose = require('mongoose')

const config = require('config')
const PORT = config.get('port')
const userRouter = require('./routes/auth.routes')
const app = express()

app.use(express.json())
app.use('/api/auth', userRouter)

const start = async () => {
    try {
        await mongoose.connect(config.get('mongoURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        app.listen(PORT, () => {
            console.log(`app has been started on port ${PORT}`)
        })
    } catch (error) {
        console.log('error ')
    }
}

start()
