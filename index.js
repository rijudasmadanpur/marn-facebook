const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmate = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auths");
const postRoute = require("./routes/posts");
const multer = require("multer");
const path = require("path");
// const cors = require("cors");

// app.use(cors());
const __dirnamea = path.resolve();
app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ extended: true, limit: "50000mb" }));

dotenv.config();

////////////////mongoose connect////////////////////

mongoose
  .connect("mongodb+srv://rijudasmadanpur:7679384329@aa.6zppczr.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log("not connected mongodb");
  });

//////////app.get///////////////

// app.get("/", (req, res) => {
//   res.send("ok1");
// });

////////////middlewere////////////////
// app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use(helmate());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (err) {
    console.log(err);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

/////////////static file//////////

app.use(express.static(path.join(__dirnamea, "./client/build")));
app.get("*", function (__, res) {
  res.sendFile(
    path.join(__dirnamea, "./client/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

const PORT = process.env.port || 8800;
app.listen(PORT, () => {
  console.log("backend server is on");
});
