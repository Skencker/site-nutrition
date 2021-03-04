const express = require("express");
const router = express.Router();
const twig = require("twig");

router.get("/", (requete, reponse) => {
    reponse.render("accueil.html.twig");
  });

//erreur 404
router.use((requete, reponse, suite) => {
  const error = new Error("Page non trouvée");
  error.status = 404;
  suite(error);
});

//gerer les autres erreurs
router.use((error, requete, reponse) => {
  reponse.status(error.status || 500);
  reponse.end(error.message);
});


module.exports = router;
