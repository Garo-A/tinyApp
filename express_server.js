const express = require ('express');
const bodyParser = require("body-parser");
const cookieSession = require ('cookie-session');
const bcrypt = require ('bcrypt');
const methodOverride = require ('method-override')
const app = express();



app.use(bodyParser.urlencoded({extended: true})); //Using body parser
app.set('view engine', 'ejs'); //Sets the view engine to render EJS files
app.use(cookieSession({
  name: 'session',
  keys: ["key1"]
}))
app.use(methodOverride('_method'));

//Setting default port.
const PORT = 8080;

let urlDatabase = {
  "b2xVn2": {
    short: 'b2xVn2',
    long: "http://www.lighthouselabs.ca",
    userID: 1
  },
  "9sm5xK": {
    short: "9sm5xK",
    long: "http://www.google.com",
    userID: 2
  }
};


let users = {
  "1": {
    id: 1,
    email: "user1@example.com",
    password: bcrypt.hashSync('blue', 10)
  },
 "2": {
    id: 2,
    email: "user2@example.com",
    password: bcrypt.hashSync('green', 10)
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

// This will go throguh urlDatabase and look for the urls containing a specific user ID. It will then return a new object with those URLs.
function URLUser(id) {
  let all = {};
  for (let url in urlDatabase){
    if (id == urlDatabase[url].userID) {
      all[url] = urlDatabase[url];
    }
  }
  return all;
}


let errorMessage = "no error";
let registrationError = "no error";


// Express starts hosting the routrs HERE.
app.get("/", function(req, res) {
  if (req.session.user_id === undefined) {
    res.redirect('/login')
  } else {
    res.redirect('/urls');
  }

})

// Shows what's currently in the urlDatabase
app.get('/urls', function(req,res){

    let user = req.session.user_id;
    res.render('urls_index', {
      urls: URLUser(user),
      username: users[req.session.user_id]
    });
})

//Takes whatver user put into urls/new page and loads into urlDatabase. Will then redirect to that short url's page
app.post('/urls', function(req,res){
  let newURL = (req.body.longURL);
  let short = generateRandomString()
  urlDatabase[short] = {};
  urlDatabase[short].short = short;
  urlDatabase[short].long = newURL;
  urlDatabase[short].userID = req.session.user_id;

  let path = `urls/${short}`
  res.redirect(path);
})


// Will ask input for long URL
app.get('/urls/new', (req, res) => {
  if (req.session.user_id !== undefined){
    res.render('urls_new', {
      username: users[req.session.user_id]
    })
  } else {
    res.redirect('/login');
  }
})

//Responsible for taking short URL and redirecting to actual webpage
app.get('/u/:shortU', function (req,res){
  for (let urlID in urlDatabase){
    if (urlID === req.params.shortU){
      let longU = urlDatabase[req.params.shortU].long;
      res.redirect(longU);
    }
  }
  res.statusCode = 400;
  res.send('Error - Shortened URL does not exist, try again');

})

//Shows Registration Page
app.get('/register', function(req,res){
  if (req.session.user_id === undefined){
    res.render('register_page', {
      registrationError: registrationError
    })
  } else {
    res.redirect('/urls');
  }
})

app.get('/login', function(req,res){
  res.render('login_page', {
    errorMessage: errorMessage
  })
})

//Shows long URL of given short URL
app.get('/urls/:id', function(req,res){
  if (req.session.user_id === undefined){
    res.redirect('/urls');
  } else {
    res.render('urls_show', {
      shortURL: req.params.id,
      urls: urlDatabase,
      username: users[req.session.user_id]
    })
  }
})

//Shows individual URL page
app.put('/urls/:id', function(req,res){
  let updatedURL = (req.body.updatedURL);
  urlDatabase[req.params.id].long = updatedURL;
  res.redirect('/urls');
})

//This ONLY executes when there's a POST request sent to this SPECIFIC path.
app.delete('/urls/:id/delete', function(req, res){
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
})

//Gets Username from input form and stores in request cookies header
app.post('/login', function(req,res){
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  for (let i in users) {
    if (users[i].email === userEmail){
      if (bcrypt.compareSync(userPassword, users[i].password)) {

        req.session.user_id = users[i].id;
        errorMessage = "no error";
        res.redirect('/urls');
        }

        else {
          res.statusCode = 403;
        }
      }
    else {
      res.statusCode = 403;
    }
  }

  if (res.statusCode === 403) {
    errorMessage = "Error";
    res.render('login_page', {
      errorMessage: errorMessage
    });
  }

})

//Will logout user and reset uername cookie to underfined
app.post('/logout', function(req,res){
  errorMessage = "no error";
  req.session = null;
  res.redirect('/urls')
})

//Creates a new User object in users using the random ID as the key and putting email + pass combo in right place
app.post('/register', function(req,res){
  let newID = generateRandomString();

//ERROR: Checks to see if any of the fields are left blank.
  if (req.body.email === "" || req.body.password === ""){
    res.statusCode = 400;
  }

  //ERROR: Checks to see if email already exists
  for (let i in users) {
    if (users[i].email === req.body.email){
      res.statusCode = 400;
    }
  }

  if (res.statusCode === 400) {
    registrationError = "error"
    res.render('register_page', {
      registrationError: registrationError
    })

  } else {
      users[newID] = {};
      users[newID].id = newID;
      users[newID].email = req.body.email;
      users[newID].password = bcrypt.hashSync(req.body.password, 10);

      registrationError = "no error";
      res.redirect('/urls')
  }
})


// This is used to actually start the server.
app.listen(PORT, function (){
  console.log(`Listening on port ${PORT}`);
})