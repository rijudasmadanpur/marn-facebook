const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const cloudinary = require("../cloudinary/cloudinary");

///////////update password/////////////

// router.put("/:id", async (req, res) => {
//   if (req.body.userId === req.params.id || req.body.isAdmin) {
//     if (req.body.password) {
//       try {
//         const salt = await bcrypt.genSalt(10);
//         req.body.password = await bcrypt.hash(req.body.password, salt);
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     }
//     try {
//       const user = await User.findByIdAndUpdate(req.params.id, {
//         $set: req.body,
//       });
//       res.status(200).json("password updated");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(403).json("you can update only your account");
//   }
// });

////////////////delete user////////////////

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only delete your accounr");
  }
});

///////////////get a user/////////////

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json("err");
  }
});

//////////get friends////////////

router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );

    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
    // console.log(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

////////////follow a user///////////

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        req.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json("err");
    }
  } else {
    res.status(403).json("you cannot follow yourself");
  }
});

/////////////unfollow user/////////////////

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      // console.log(user);
      // console.log(currentUser);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        req.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json("err");
    }
  } else {
    res.status(403).json("you cannot unfollow yourself");
  }
});

/////////////get all user////////
router.get("/allfriends", async (req, res) => {
  const allfriend = await User.find();
  try {
    // console.log(allfriend);
    res.status(200).json(allfriend);
  } catch (err) {
    console.log(err);
  }
});
//////////update profile picture/////////
router.post("/upCloudinary", async (req, res) => {
  const { image } = req.body;
  const uploadedImage = await cloudinary.uploader.upload(image);
  // console.log(uploadedImage.url);
  res.status(200).json(uploadedImage.url);
});

//////////////////

router.put("/updateDp", async (req, res) => {
  // console.log(req.body.currentUser);
  // console.log(req.body.imageUrl);

  await User.findOneAndUpdate(
    { _id: req.body.currentUser },
    {
      $set: {
        profilePicture: req.body.imageUrl,
      },
    }
  );
  res.status(200).json("Your profile picture has uploaded");
});

//////////////update user//////////
router.put("/update", async (req, res) => {
  await User.findOneAndUpdate(
    { _id: req.body.currentUser },
    {
      $set: {
        desc: req.body.desc,
        city: req.body.city,
        form: req.body.country,
        // relationship: req.body.relationship,
      },
    }
  );

  await res.json("User details has updated");
});

module.exports = router;

// router.post("/reg", (req, res) => {
//   const newUser = new User({
//     username: req.body.username,
//     email: req.body.email,
//     password: req.body.password,
//     desc: req.body.desc,
//     city: req.body.city,
//     form: req.body.form,
//   });
//   const user = newUser.save();
//   res.status(200).json(user);
// });
