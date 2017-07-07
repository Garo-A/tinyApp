const express = require ('express');
const bodyParser = require("body-parser");
const cookieSession = require ('cookie-session');
const bcrypt = require ('bcrypt');
const methodOverride = require ('method-override');
const app = express();



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ["key1"]
}));
app.use(methodOverride('_method'));


const PORT = 8080;

//Contains information about URLs.
let urlDatabase = {
  "b2xVn2": {
    short: 'b2xVn2',
    long: "http://www.lighthouselabs.ca",
    userID: 1,
    count: 0
  },
  "9sm5xK": {
    short: "9sm5xK",
    long: "http://www.google.com",
    userID: 2,
    count: 0
  }
};

//Contains infromation about users.
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

// Generates random number.
function generateRandomString() {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( var i = 0; i < 5; i++ ) {
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    };
  return text;
};

// Returns an array containing a given user's generated URLs.
function URLUser(id) {
  let all = {};
  for (let url in urlDatabase){
    if (id == urlDatabase[url].userID) {
      all[url] = urlDatabase[url];
    };
  };
  return all;
};


let errorMessage = "no error";
let registrationError = "no error";

// Home - Redirects to URLs Index if there is a user logged in, if not goes to Login page.
app.get("/", function(req, res) {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  };
})

// Shows URLs for a user that is logged in.
app.get('/urls', function(req,res){

    let user = req.session.user_id;
    res.render('urls_index', {
      urls: URLUser(user),
      username: users[req.session.user_id]
    });
});

//Adds a new, short URL to database with ID of user that created it.
app.post('/urls', function(req,res){
  let newURL = (req.body.longURL);
  let short = generateRandomString();
  urlDatabase[short] = {};
  urlDatabase[short].short = short;
  urlDatabase[short].long = newURL;
  urlDatabase[short].userID = req.session.user_id;
  urlDatabase[short].count = 0;

  let path = `urls/${short}`;
  res.redirect(path);
})


//Shows input field to shorten new URL.
app.get('/urls/new', (req, res) => {
  if (req.session.user_id !== undefined){
    res.render('urls_new', {
      username: users[req.session.user_id]
    });
  } else {
    res.redirect('/login');
  };
});

//Responsible for taking short URL and redirecting to actual webpage
app.get('/u/:shortU', function (req,res){
  for (let urlID in urlDatabase){
    if (urlID === req.params.shortU){
      let longU = urlDatabase[req.params.shortU].long;
      urlDatabase[req.params.shortU].count ++;
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
    });
  } else {
    res.redirect('/urls');
  };
});

app.get('/login', function(req,res){
  res.render('login_page', {
    errorMessage: errorMessage
  });
});

//Shows a view page for a given short URL and all data associated to it. Also allows user who creted URL to edit it.
app.get('/urls/:id', function(req,res){
  if (req.session.user_id === undefined){
    res.redirect('/urls');
  } else {
    res.render('urls_show', {
      shortURL: req.params.id,
      urls: urlDatabase,
      username: users[req.session.user_id]
    });
  };
});

//Allows a given user to modify a URL that belongs to them.
app.put('/urls/:id', function(req,res){
  let updatedURL = (req.body.updatedURL);
  urlDatabase[req.params.id].long = updatedURL;
  res.redirect('/urls');
});

//Allows user to delete a created URL.
app.delete('/urls/:id/delete', function(req, res){
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Checks login information with user database, and if everything matches, sets cookies.
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
        };
      }
    else {
      res.statusCode = 403;
    };
  };

  if (res.statusCode === 403) {
    errorMessage = "Error";
    res.render('login_page', {
      errorMessage: errorMessage
    });
  };

});

//Allows user to logout, resets cookies.
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
    registrationError = "error";
    res.render('register_page', {
      registrationError: registrationError
    });

  } else {
      users[newID] = {};
      users[newID].id = newID;
      users[newID].email = req.body.email;
      users[newID].password = bcrypt.hashSync(req.body.password, 10);

      registrationError = "no error";
      res.redirect('/urls');
  }
});



app.listen(PORT, function (){
  console.log(`Listening on port ${PORT}`);
})