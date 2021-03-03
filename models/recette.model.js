const mongoose = require("mongoose");

const recetteSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom: String,
    ingredients: String,
    recette : String,
    image : String
})
module.exports = mongoose.model("Recette",recetteSchema);