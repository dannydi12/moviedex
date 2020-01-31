require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const allMovies = require('./movies-data-small.json');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(validateToken);

function validateToken(req, res, next) {
  if(!req.headers.authorization) {
    res.status(401).send('Send an API key');
  }
  if(req.headers.authorization.split(' ')[1] !== process.env.API_KEY) {
    res.status(401).send('Not authorized');
  }
  next();
}

function handleMovie(req, res) {
  const { genre, country, avg_vote } = req.query;

  let filteredMovies = allMovies;

  if(genre) {
    filteredMovies = filteredMovies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }
  if(country) {
    filteredMovies = filteredMovies.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }
  if(avg_vote) {
    filteredMovies = filteredMovies.filter(movie => Number(avg_vote) <= movie.avg_vote); 
  }

  res.send(filteredMovies);
}

app.get('/movie', handleMovie);

module.exports = app;