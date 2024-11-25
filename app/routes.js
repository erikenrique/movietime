module.exports = function (app, passport, db) {
  const Review = require('./models/review');
  const Movie = require('./models/movie');
  const fetch = require('node-fetch');
  const TMDB_API_KEY = '8a11bdefa63f3043a5ec0c27664861b3';

  // Home Page
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  // Login Routes
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true,
    })
  );

  // Signup Routes
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post(
    '/signup',
    passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true,
    })
  );

  // Profile Page
  app.get('/profile', isLoggedIn, async (req, res) => {
    try {
      const reviews = await Review.find({ userId: req.user._id }).lean();
      res.render('profile.ejs', {
        user: req.user,
        reviews: reviews,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching reviews');
    }
  });

  // Edit Review
  app.put('/profile/edit-review', isLoggedIn, async (req, res) => {
    const { movie_id, movie_title, rating, review } = req.body;

    try {
      const updatedReview = await Review.findByIdAndUpdate(
        movie_id,
        {
          movie_title,
          rating: parseInt(rating, 10),
          text: review,
        },
        { new: true }
      );

      if (!updatedReview) {
        return res.status(404).send('Review not found');
      }

      res.json(updatedReview);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating review');
    }
  });

  // Add Movie and Review
  app.post('/profile/add-movie', isLoggedIn, async (req, res) => {
    const { movie_title, release_date, poster_path, overview, rating, review } = req.body;

    try {
      let movie = await Movie.findOne({ title: movie_title });

      if (!movie) {
        movie = new Movie({
          title: movie_title,
          release_date: release_date || 'Unknown',
          poster_url: poster_path || '',
          overview: overview || 'No overview available',
        });
        await movie.save();
      }

      const newReview = new Review({
        userId: req.user._id,
        movie_title: movie.title,
        movieId: movie._id,
        rating: parseInt(rating, 10),
        text: review,
        poster_path: poster_path,
      });

      await newReview.save();

      const reviews = await Review.find({ movieId: movie._id });
      const avgRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      movie.avg_rating = avgRating;
      await movie.save();

      res.redirect(`/movie/${movie._id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding review or movie');
    }
  });

  // Delete Review
  app.delete('/profile/delete-review/:id', isLoggedIn, async (req, res) => {
    const reviewId = req.params.id;

    try {
      const deletedReview = await Review.findByIdAndDelete(reviewId);

      if (!deletedReview) {
        return res.status(404).send('Review not found');
      }

      res.status(200).send({ message: 'Review deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting review');
    }
  });

  // Movie Page
  app.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
      const movie = await Movie.findById(movieId);

      if (!movie) {
        return res.status(404).send('Movie not found');
      }

      const reviews = await Review.find({ movieId }).lean();
      res.render('movie.ejs', { movie, reviews });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching movie details');
    }
  });

  // Add Comment
  app.post('/movie/:id/comment', isLoggedIn, async (req, res) => {
    const movieId = req.params.id;
    const { comment } = req.body;

    try {
      const movie = await Movie.findById(movieId);

      if (!movie) {
        return res.status(404).send('Movie not found');
      }

      movie.comments.push(comment);
      await movie.save();
      res.redirect(`/movie/${movieId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding comment');
    }
  });

  // TMDb API Search
  app.get('/search-movies', (req, res) => {
    const query = req.query.q;
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`)
      .then((response) => response.json())
      .then((data) => {
        res.json(data.results);
      })
      .catch((err) => console.log(err));
  });

  // Logout
  app.get('/logout', (req, res) => {
    req.logout(() => {
      console.log('User has logged out!');
    });
    res.redirect('/');
  });

  // Middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
  }
};
