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

// Will basically generate a random number, round down, multiply by charset length, get approprate charset letter and return a string of 5 chars long.
function generateRandomString() {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i = 0; i < n5; i++ ) {
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  return text;
}

// Express starts hosting the routrs HERE.
app.get("/", function(req, res) {
  res.render('home.ejs');
})

// Shows what's currently in the urlDatabase
app.get('/urls', function(req,res){
  res.render('urls_index', {
    urls: urlDatabase,
    username: req.cookies["username"]
  });
})

//Takes whatver user put into urls/new page and loads into urlDatabase. Will then redirect to that short url's page
app.post('/urls', function(req,res){
  let newURL = (req.body.longURL);
  let short = generateRandomString()
  urlDatabase[short] = newURL;
  let path = `urls/${short}`
  console.log(req.body);
  res.redirect(path);
})


// Will ask input for long URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new', {
    username: req.cookies['username']
  })
})

//Responsible for taking short URL and redirecting to actual webpage
app.get('/u/:shortU', function (req,res){
  let longU = urlDatabase[req.params.shortU]
  res.redirect(longU);
})

//Shows long URL of given short URL
app.get('/urls/:id', function(req,res){
  res.render('urls_show', {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies['username']
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
  let user = req.body.username;
  console.log(user);
  res.cookie('username', user);
  res.redirect('/urls');
})

//Will logout user and reset uername cookie to underfined
app.post('/logout', function(req,res){
  res.clearCookie('username');
  res.redirect('/urls')
})


// This is used to actually start the server.
app.listen(PORT, function (){
  console.log(`Listening on port ${PORT}`);
})