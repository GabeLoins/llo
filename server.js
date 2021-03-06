var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('underscore');

/* DATABASE CONFIGURATION */

/*
 * Here we connect as a demo user to our demo database. If you want control
 * over your Llo's data, you can create your own database for free at 
 * mongolab.com. Then, mongolab will give you a seperate URL to connect to.
 */
mongoose.connect('mongodb://user:abc123@ds053130.mongolab.com:53130/llo');

/*
 * A schema is like a contract of how we will represent a post in our database.
 */
var PostSchema = mongoose.Schema({
  timestamp: Date,
  content: String,
});

/*
 * A model is the API for a mongoose schema. A schema defines how the data is
 * structured. A model lets us interact with the data. With a model we can
 * query and save data to our database.
 */
var Post = mongoose.model('Post', PostSchema);


/* SERVER CONFIGURATION */

var app = express();

/*
 * Sets the template rendering engine in of express to be embedded javascript,
 * and for it to look in the ./views/ directory for the templates.
 */
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

/*
 * Here we define middleware, things to do before moving on to our own request
 * handlers. All of these app.*'s are done in the order that a request would be
 * processed, so order matters! Here we:
 *
 *  1. Check if the request matches a static file in /public/ if so, then simply
 *     serve it.
 *  2. Extract url encoded parameters on requests and put it in req.body
 */
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

/*
 * Defines the action we take when the user hits our main page.
 */
app.get('/', function (req, res) {
  // Searches through our database for all Post objects that match our query.
  Post.find({}, function(err, posts) {
    if (err) {
      res.status(500).send('There was an error fetching posts.');
    } else {
      // MongoDB objects are necessarily ordered, so it's important to
      // sort the posts by time. We use underscore's sort here, but
      // you could as easily do posts.sort() with a comparison function.
      sortedPosts = _.sortBy(posts, 'timestamp');

      // Renders the home.ejs template, with access to the variable 'posts'
      res.render('home', {posts: sortedPosts});
    }
  });
});

/*
 * Defines the action we take when the user submits a post.
 * Creates and saves a new post to the database.
 */
app.post('/submit', function (req, res) {
  // reads the content field sent by the POST request
  var content = req.body.content;
  // creates a new post object to save to our database
  var newPost = new Post({
    timestamp: Date.now(),
    content: content,
  });
  // saves the post to our database
  newPost.save(function(err) {
    if (err) {
      res.status(500).send('There was an error saving your post.');
    } else {
      res.redirect('/');
    }
  });
});

/*
 * Start up the server and listen to the environment's PORT variable,
 * (useful for deployment) or a default port, 3000.
 */
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log('Llo listening at http://localhost:' + port);
});
