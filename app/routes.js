module.exports = function(app, passport, db) {
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
      res.render('index.ejs');
  });

  // LOGIN ===============================
  // show the login form
  app.get('/login', function(req, res) {
      res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/login', // redirect back to the login page if there is an error
      failureFlash: true, // allow flash messages
  }));

  // SIGNUP ===============================
  // show the signup form
  app.get('/signup', function(req, res) {
      res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/signup', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
  }));

  // PROFILE SECTION =========================
  const Review = require('./models/review');

  app.get('/profile', isLoggedIn, async (req, res) => {
    try {
      // using the review.js model to fetch all reviews for the logged-in user (mongoose)
      // https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
      const reviews = await Review.find({ userId: req.user._id });
      res.render('profile.ejs', {
        user: req.user, // attaches user obj (ty Passport)
        reviews: reviews, // pass fetched reviews to the view
      });
    } catch (err) {
      console.error(err);
      res.send('Error fetching reviews');
    }
  });
  
  
  app.put('/profile/edit-review', isLoggedIn, async (req, res) => {
    try {
        const movie_id = req.body.movie_id;
        const movie_title = req.body.movie_title;
        const rating = req.body.rating;
        const review = req.body.review;

        const updatedReview = await Review.findByIdAndUpdate(
            movie_id,
            {
            'movie_title': movie_title,
            'rating': rating,
            'text': review,
            },
            { new: true } // returns updated document (mongodb)
        );
    
        if (!updatedReview) {
            return res.send('error');
        }
    
        res.send('review updated'); 
        } catch (err) {
            console.error(err);
            res.send('error');
        }
  });
  
  

  app.post('/profile/add-movie', isLoggedIn, async (req, res) => {
    try {
        const movie_title = req.body.movie_title
        const rating = req.body.rating
        const review = req.body.review

        await Review.create({
            'userId': req.user._id,
            'movie_title': movie_title,
            'rating': rating, 
            'text': review
        })
        res.redirect('/profile');

    } catch (err) {
      console.error(err);
      res.send('Error');
    }
  });

  app.delete('/profile/delete-review/:id', isLoggedIn, async (req, res) => {
  
    try {
        const reviewId = req.params.id;
        const deletedReview = await Review.findByIdAndDelete(reviewId);
    
        if (!deletedReview) {
            return res.send('Error: delete review');
        }
    
        res.send('Review deleted'); 
    } catch (err) {
      console.error(err);
      res.send('Error: delete review end');
    }
  });
  

  // MOVIE PAGE =============================
  // dedicated movie pages made upon being reviewed
  // v2
  
//   app.get('/movie/:id', (req, res) => {
//       const movieId = req.params.id;
//       db.collection('movies').findOne({ _id: movieId }, (err, movie) => {
//           if (err) return console.log(err);
//           if (!movie) return res.status(404).send('Movie not found');
//           res.render('movie.ejs', { movie });
//       });
//   });

  // MOVIE SEARCH (API, v2 work )===================

//   const fetch = require('node-fetch');
//   const TMDB_API_KEY = 'tbd';

//   app.get('/search-movies', (req, res) => {
//       const query = req.query.q;
//       fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`)
//           .then((response) => response.json())
//           .then((data) => {
//               res.json(data.results);
//           })
//           .catch((err) => console.log(err));
//   });

  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
      req.logout(() => {
          console.log('User has logged out!');
      });
      res.redirect('/');
  });

  // middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect('/');
  }
};
