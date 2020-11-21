const express = require('express')
const cors = require('cors')
const LoggingAPI = require('./middleware/LoggingAPI')

const PORT = 2000

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Welcome To API')
})

// for get image
app.use('/public', express.static('public'))

app.use(LoggingAPI)


app.listen(PORT, () => console.log(`API Running on port ${PORT}`))

