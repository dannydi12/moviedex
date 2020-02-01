require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const allMovies = require("./movies-data-small.json");

const morgansetting = process.env.NODE_ENV === "production" ? "tiny" : "dev";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan(morgansetting));
app.use(validateToken);

// Error handler so that in production we don't give out sensitive info

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

function validateToken(req, res, next) {
  if (!req.headers.authorization) {
    res.status(401).send("Send an API key");
  }
  if (req.headers.authorization.split(" ")[1] !== process.env.API_KEY) {
    res.status(401).send("Not authorized");
  }
  next();
}

function handleMovie(req, res) {
  const { genre, country, avg_vote } = req.query;

  let filteredMovies = allMovies;

  if (genre) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  if (country) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  if (avg_vote) {
    filteredMovies = filteredMovies.filter(
      movie => Number(avg_vote) <= movie.avg_vote
    );
  }

  res.send(filteredMovies);
}

app.get("/movie", handleMovie);

module.exports = app;
