const express = require("express");
const router = express.Router();
const twig = require("twig");
const mongoose = require("mongoose");
const recetteSchema = require("./models/recette.model");
const multer = require("multer");
const fs = require("fs");

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

router.get("/", (requete, reponse) => {
  reponse.render("accueil.html.twig");
});

//route pour trouver les recettes liste
router.get("/recettes", (requete, reponse) => {
  //recuperation recettes
  recetteSchema
    .find()
    .exec()
    .then((recettes) => {
      //   console.log(recettes);
      reponse.render("recettes.html.twig", {
        recettes: recettes,
        message: reponse.locals.message,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

//pour recuperer une recette en fonction  son id
router.get("/recettes/:id", (requete, reponse) => {
  //recuperation une recette
  recetteSchema
    .findById(requete.params.id)
    .exec()
    .then((recette) => {
      //   console.log(recette);
      reponse.render("recette.html.twig", {
        recette: recette,
        isModification: false,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

//route pour trouver une recette
router.get("/recettes/:nom", (requete, reponse) => {
  //   console.log(requete.params.nom);
  reponse.render("recette.html.twig", { nom: requete.params.nom });
});

//route pour enregistrer le formulaire et enregistrer la recette dans la bdd
router.post("/recettes", upload.single("image"), (requete, reponse) => {
  const recette = new recetteSchema({
    _id: new mongoose.Types.ObjectId(),
    nom: requete.body.nom,
    ingredients: requete.body.ingredients,
    recette: requete.body.recette,
    image: requete.file.path.substring(14),
  });
  recette
    .save()
    .then((resultat) => {
      reponse.redirect("/recettes");
    })
    .catch((error) => {
      console.log(error);
    });
});

//modification de l'image
router.post("/recettes/updateImage", upload.single("image"), (requete, reponse) => {
 const recette = recetteSchema.findById(requete.body.identification)
 //recuperer l'ancienne image
  .select("image")
  .exec()
  .then(recette => {
      fs.unlink("./public/images/"+ recette.image, error => {
          console.log(error);
      })
      const recetteUpdate = {
          image : requete.file.path.substring(14)
      }
      //remplacer l'image
      recetteSchema.updateOne({_id:requete.body.identification}, recetteUpdate)
      .exec()
      .then(resultat => {
          reponse.redirect("/recettes/modification/" + requete.body.identification)
      })
      .catch(error => {
          console.log(error);
      })
  });
 
})

//route pour moodifier une recette formulaire
router.get("/recettes/modification/:id", (requete, reponse) => {
  recetteSchema
    .findById(requete.params.id)
    .exec()
    .then((recette) => {
      //   console.log(recette);
      reponse.render("recette.html.twig", {
        recette: recette,
        isModification: true,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

//modification d'une recette
router.post("/recettes/modificationServer", (requete, reponse) => {
  const recetteUpdate = {
    nom: requete.body.nom,
    ingredients: requete.body.ingredients,
    recette: requete.body.recette,
  };
  recetteSchema
    .updateOne({ _id: requete.body.identification }, recetteUpdate)
    .exec()
    .then((resultat) => {
      if (resultat.nModified < 1) throw new Error("Requéte de modif échouer");
      console.log(resultat);
      requete.session.message = {
        type: "success",
        contenu: "Modification effectuée",
      };
      reponse.redirect("/recettes");
    })
    .catch((error) => {
      console.log(error);
      requete.session.message = {
        type: "success",
        contenu: error.message,
      };
    });
});

//supprimer une recette
router.post("/recettes/delete/:id", (requete, reponse) => {
  const recette= recetteSchema.findById(requete.params.id)
   .select("image")
   .exec()
   .then(recette => {
       fs.unlink("./public/images/"+ recette.image, error => {
           console.log(error);
       })
       recetteSchema.remove({_id:requete.params.id})
           .exec()
           .then(resultat => {
               requete.session.message = {
                   type : 'success',
                   contenu : 'Suppression effectuée'
               }
               reponse.redirect("/recettes");
           })
           .catch(error => {
               console.log(error);
           })
   })
   .catch(error => {
       console.log(error);
   })
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
