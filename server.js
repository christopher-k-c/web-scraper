const PORT = 8000
const express = require('express')
const app = express()


const kristinaRouter = require("./routes/KristinaRecords/kristina-techno")

app.use("/", kristinaRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

