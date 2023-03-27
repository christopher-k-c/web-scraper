const express= require("express");

const router = express.Router()

router.use(express.json())

const kristinaTechnoCtrl = require("../../controllers/KristinaRecords/kristina-techno")

router.get("/kristina/technoindex", kristinaTechnoCtrl.kristina_technoindex_get)

module.exports = router;