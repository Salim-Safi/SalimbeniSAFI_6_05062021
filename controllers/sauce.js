const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      sauce = new Sauce(sauce);
      if (!sauce.usersLiked.includes(userId) && like === 1) {
        sauce.usersLiked.push(userId);
        sauce.likes++;
      } else if (sauce.usersLiked.includes(userId) && like === 0) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
        sauce.likes--;
      } else if (!sauce.usersDisliked.includes(userId) && like === -1) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes++;
      } else if (sauce.usersDisliked.includes(userId) && like === 0) {
        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
        sauce.dislikes--;
      }
      sauce
        .save()
        .then(() => res.status(200).json({ message: "Like Ajouté" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
