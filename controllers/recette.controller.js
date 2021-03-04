const mongoose = require("mongoose");
const recetteSchema = require("../models/recette.model");
const fs = require("fs");

exports.recettes_affichage = (requete, reponse) => {
  //recuperation recettes
  recetteSchema
    .find()
    .exec()
    .then((recettes) => {
        console.log(recettes);
      reponse.render("recettes.html.twig", {
        recettes: recettes,
        message: reponse.locals.message,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.recettes_ajout = (requete, reponse) => {
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
};

exports.recette_affichage = (requete, reponse) => {
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
};

exports.recette_modif_image = (requete, reponse) => {
  const recette = recetteSchema
    .findById(requete.body.identification)
    //recuperer l'ancienne image
    .select("image")
    .exec()
    .then((recette) => {
      fs.unlink("./public/images/" + recette.image, (error) => {
        console.log(error);
      });
      const recetteUpdate = {
        image: requete.file.path.substring(14),
      };
      //remplacer l'image
      recetteSchema
        .updateOne({ _id: requete.body.identification }, recetteUpdate)
        .exec()
        .then((resultat) => {
          reponse.redirect(
            "/recettes/modification/" + requete.body.identification
          );
        })
        .catch((error) => {
          console.log(error);
        });
    });
};

exports.recette_modif = (requete, reponse) => {
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
};

exports.recette_modif_serv = (requete, reponse) => {
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
};

exports.recette_delete = (requete, reponse) => {
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
   }
