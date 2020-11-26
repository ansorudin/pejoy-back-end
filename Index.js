const express = require('express');
const cors = require('cors');
const LoggingAPI = require('./middleware/LoggingAPI');

const landingPageRouter = require('./routers/landingPageRouter');
const productRouter = require('./routers/productRouter');
const userProfileRouter = require('./routers/userProfileRouter');

const PORT = 2000

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Welcome To API')
})

app.use(LoggingAPI)
// For Get Image
app.use('/public', express.static('public'))
// Router For Landing Page
app.use('/', landingPageRouter)
// Router For Products
app.use('/products', productRouter)
// Router For User Profile
app.use('/member', userProfileRouter)

app.listen(PORT, () => console.log(`API Running On Port ${PORT}`))

