const express = require("express");
const router = express.Router();
const twig = require("twig");
const multer = require("multer");

const recetteController = require("../controllers/recette.controller");

//destination de l'image dans public + encodage du nom de l'image avec date + chiffre aléatoire + nom
const storage = multer.diskStorage({
  destination: (requete, file, cb) => {
    //cb = callback
    cb(null, "./public/images/");
  },
  filename: (requete, file, cb) => {
    // var date = new Date().toLocaleDateString();
    cb(null, "-" + Math.round(Math.random() * 10000) + "-" + file.originalname);
  },
});
// filtre du type de fichier jpg ou png
const fileFilter = (requete, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("l'image n'est pas acceptée"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});



//route pour trouver les recettes liste
router.get("/recettes", recetteController.recettes_affichage );

//route pour enregistrer le formulaire et enregistrer la recette dans la bdd
router.post("/recettes", upload.single("image"), recetteController.recettes_ajout);

//pour recuperer une recette en fonction  son id
router.get("/recettes/:id", recetteController.recette_affichage );

//route pour moodifier une recette formulaire
router.get("/recettes/modification/:id", recetteController.recette_modif);

//route pour trouver une recette
// router.get("/recettes/:nom", (requete, reponse) => {reponse.render("recettes.html.twig", { nom: requete.params.nom });});

//modification de l'image
router.post("/recettes/updateImage", upload.single("image"), recetteController.recette_modif_image)

//modification d'une recette
router.post("/recettes/modificationServer", recetteController.recette_modif_serv );

//supprimer une recette
router.post("/recettes/delete/:id", recetteController.recette_delete );
 
module.exports = router;
