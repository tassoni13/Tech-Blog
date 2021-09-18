const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');

//Gets all posts and displays them on homepage
router.get('/', async (req, res) => {
    try {
        const postData = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['name'],
                },
            ],
        });
        const posts = postData.map((post) => post.get({ plain: true}));

        res.render('homepage', {
            posts,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    } 
});

//To login page
router.get('/login', (req, res) => {
    //Redirects user to homepage if they are logged in
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
});

//To signup page
router.get('/signup', (req, res) => {
    //Redirects user to homepage if they are logged in
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('signup');
});

//Gets a single post
router.get('/post/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });
        if (!postData) {
            res.status(404).json({ message: 'No post found with this id!'});
            return;
        }
        const post = postData.get({ plain: true });

        res.render('read-post', {
            ...post,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

//To user's dashboard
// Use withAuth middleware to prevent access to route
router.get('/dashboard', withAuth, async (req, res) => {
    try {
      // Find the logged in user based on the session ID
      const userData = await User.findByPk(req.session.user_id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Post }],
      });
  
      const user = userData.get({ plain: true });
  
      res.render('dashboard', {
        ...user,
        logged_in: true
      });
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //To edit a post
  router.get('/edit/:id', withAuth, async (req, res) => {
      try {
          const postData = await Post.findByPk(req.params.id);

          if (!postData) {
              res.status(404).json({ message: 'No post found with this id!' });
              return;
          }
          const post = postData.get({ plain: true });

          res.render('edit', { post, logged_in: true });
      } catch (err) {
          res.status(500).json(err);
      }
  });

  router.get('/newpost', (req, res) => {
      res.render('newpost');
  });

  module.exports = router;