const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render('index', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};

exports.createUser = async (req, res) => {
  try {
    await User.create(req.body);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(400).send('Erreur de validation');
  }
};