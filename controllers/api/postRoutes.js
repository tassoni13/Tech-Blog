const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

//Get all posts
router.get('/', async (req, res) => {
    try {
        const postData = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['name']
            }]
        });
        res.status(200).json(postData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Gets single post by id
router.get('/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['name']
            },
            {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['name']
                }]
            }]
        });
        if (!postData) {
            res.status(404).json({message: 'No post found with this id!'});
            return;
        }
        res.status(200).json(postData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Allows logged in users to create new post
router.post('/', withAuth, async (req, res) => {
    try {
        const postData = await Post.create({
            ...req.body,
            user_id: req.session.user_id
        });
        res.status(200).json(postData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Allows logged in users to update post
router.put('/:id', withAuth, async (req, res) => {
    try {
        const postData = await Post.update(req.body, {
            where: {
                id: req.params.id
            },
        });
        if (!postData) {
            res.status(404).json({message: 'No post found with this id!'});
            return;
        }
        res.status(200).json(postData);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Allows logged in users to delete post
router.delete('/:id', withAuth, async (req, res) => {
    try {
        const postData = await Post.destroy({
            where: {
                id: req.params.id
            },
        });
        if (!postData) {
            res.status(404).json({message: 'No post found with this id!'});
            return;
        }
        res.status(200).json(postData);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;