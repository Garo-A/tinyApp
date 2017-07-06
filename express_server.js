const express = require ('express');
const bodyParser = require("body-parser");
const cookieParser = require ('cookie-parser');
const app = express();



app.use(bodyParser.urlencoded({extended: true})); //Using body parser
app.set('view engine', 'ejs'); //Sets the view engine to render EJS files
app.use(cookieParser())

//Setting default port.
const PORT = 8080;

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  "1": {
    id: "1",
    email: "user1@example.com",
    password: "blue"
  },
 "2": {
    id: "2",
    email: "user2@example.com",
    password: "green"
  }
}

// Will basically generate a random number, round down, multiply by charset length, get approprate charset letter and return a string of 5 chars long.
function generateRandomString() {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i = 0; i < 5; i++ ) {
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  return text;
}

//Template Variables. CHECK THIS OUT TO SEE HOW I CAN CALL.
let templateVars = {
  urls: urlDatabase
}


// Express starts hosting the routrs HERE.
app.get("/", function(req, res) {
  res.render('home.ejs');
})

// Shows what's currently in the urlDatabase
app.get('/urls', function(req,res){
  res.render('urls_index', {
    urls: urlDatabase,
    username: users[req.cookies["user_id"]]
  });
})

//Takes whatver user put into urls/new page and loads into urlDatabase. Will then redirect to that short url's page
app.post('/urls', function(req,res){
  let newURL = (req.body.longURL);
  let short = generateRandomString()
  urlDatabase[short] = newURL;
  let path = `urls/${short}`
  res.redirect(path);
})


// Will ask input for long URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new', {
    username: users[req.cookies["user_id"]]
  })
})

//Responsible for taking short URL and redirecting to actual webpage
app.get('/u/:shortU', function (req,res){
  let longU = urlDatabase[req.params.shortU]
  res.redirect(longU);
})

//Shows Registration Page
app.get('/register', function(req,res){
  res.render('register_page')
})

app.get('/login', function(req,res){
  res.render('login_page')
})

//Shows long URL of given short URL
app.get('/urls/:id', function(req,res){
  res.render('urls_show', {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: users[req.cookies["user_id"]]
  })
})

//Shows individual URL page
app.post('/urls/:id', function(req,res){
  let updatedURL = (req.body.updatedURL);
  urlDatabase[req.params.id] = updatedURL;
  res.redirect('/urls');
})

//This ONLY executes when there's a POST request sent to this SPECIFIC path.
app.post('/urls/:id/delete', function(req, res){
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
})

//Gets Username from input form and stores in request cookies header
app.post('/login', function(req,res){
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  console.log(`Email: ${userEmail} Password: ${userPassword}`);

  for (let i in users) {
    if (users[i].email === userEmail){
      if (users[i].password === userPassword) {
        res.cookie('user_id', users[i].id)
        res.redirect('/urls');
        }
        else {
          res.statusCode = 403;
        }
      }
    else {
      res.statusCode = 403;
    }
    console.log([i]);
  }
})

//Will logout user and reset uername cookie to underfined
app.post('/logout', function(req,res){
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//Creates a new User object in users using the random ID as the key and putting email + pass combo in right place
app.post('/register', function(req,res){
  let newID = generateRandomString();

//ERROR: Checks to see if any of the fields are left blank.
  if (req.body.email === "" || req.body.password === ""){
    res.statusCode = 400;
    res.send("Please fill in form")
    return
  }

  //ERROR: Checks to see if email already exists
  for (let i in users) {
    if (users[i].email === req.body.email){
      res.statusCode = 400;
      res.send("Email already exists");
      return;
    }
  }
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    users[newID].password = req.body.password;
    console.log(users);

    // res.cookie('user_id', newID);
    res.redirect('/urls')
})


// This is used to actually start the server.
app.listen(PORT, function (){
  console.log(`Listening on port ${PORT}`);
})