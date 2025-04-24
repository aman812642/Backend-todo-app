const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const userModel = require("./model/user");
const todoModel = require("./model/todo");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, email, age, password } = req.body;
  const user = await userModel.findOne({ email });
  if (user) return res.status(500).send("Email Already Exists !");

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      let user = await userModel.create({
        name,
        email,
        age,
        password: hash,
      });
      const token = jwt.sign({ email: user.email, userid: user._id }, "secret");
      res.cookie("token", token);
      res.send("registerd");
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.send("Email or Password is wrong !");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      const token = jwt.sign({ email: user.email, userid: user._id }, "secret");
      res.cookie("token", token);
      return res.redirect("/profile");
    } else return res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    next();
  }
}

app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email }).populate('todos')
  res.render("profile", { user });
});

app.post("/todo", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const { todotitle, todocontent } = req.body;
  const todo = await todoModel.create({
    todotitle: todotitle,
    todocontent: todocontent,
    user: user._id,
  });
  user.todos.push(todo._id);
  await user.save();
  res.redirect('/profile')
});

app.get('/delete/:id' , isLoggedIn , async (req , res) => {
  const todoId = req.params.id
  const user = await userModel.findOne({email : req.user.email})
  await todoModel.findByIdAndDelete(todoId)
  user.todos = user.todos.filter((todo) => todo.toString() !== todoId )
  await user.save()
  res.redirect('/profile');
})

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const todo = await todoModel.findById(req.params.id);
  res.render("edit", { todo });
});

app.post("/edit/:id", isLoggedIn, async (req, res) => {
  const { todotitle, todocontent } = req.body;
  await todoModel.findByIdAndUpdate(req.params.id, { todotitle, todocontent });
  res.redirect("/profile");
});

app.listen(3000, () => {
  console.log(`your server is running on http://localhost:3000`);
});
