module.exports = {
  index: async (req, res) => {
    try {
      res.render('index', {
        title: 'Dashboard',
      });
    } catch (error) {
      res.status(500).send('Something broke!');
    }
  },
};
