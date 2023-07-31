const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("../cloudinary/cloudinary");

/////////create post/////////

// router.post("/", async (req, res) => {
//   const { image } = req.body;
//   const uploadedImage = await cloudinary.uploader.upload(image);
//   res.json(uploadedImage.url);
// });
router.post("/upload", async (req, res) => {
  const newpost = new Post(req.body);
  try {
    const savedPost = await newpost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
// router.post("/", async (req, res) => {
//   const newpost = new Post(req.body);
//   try {
//     const savedPost = await newpost.save();
//     res.status(200).json(savedPost);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

///////////update post//////////////

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

///////////delete post//////////////

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can dekete onlyyour post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

////////////////////like dislike/////////////////////

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

////////////////////get a post/////////////////////

router.get(":/id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//////////////get timeline post//////////////

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
    // res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
// router.get("/timeline/all", async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.params.userId);
//     const userPosts = await Post.find({ userId: currentUser._id });
//     const friendPosts = await Promise.all(
//       currentUser.followings.map((friend) => {
//         return Post.find({ userId: friendId });
//       })
//     );
//     res.status(200).json(userPosts.concat(...friendPosts));
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//////////////get user's all post//////////////

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;

// router.post("/register", (req, res) => {
//   const newUser = new Post({
//     userId: req.body.userId,
//     desc: req.body.desc,
//     img: req.body.image,
//     likes: req.body.likes,
//   });
//   try {
//     const save = newUser.save();
//     res.status(200).json(save);
//   } catch (err) {
//     console.log(err);
//   }
// });

// router.get("/register", (req, res) => {
//   const newUser = new Post({
//     userId: "64a4c2059fb8d1dcf549133f",

//     desc: "i am riju",

//     img: "image",

//     likes: 20,
//   });
//   newUser.save();
//   res.send("Ok");
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     res.status(200).json(post);
//   } catch (err) {
//     console.log(err);
//   }
// });
