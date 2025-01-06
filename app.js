//app.js
const path = require("node:path")
const express = require("express")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const pgSession = require('connect-pg-simple')(session)
require('dotenv').config();
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

//create express application
const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath))

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
)

//define strategies
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {

    } catch (err) {
      return done(err)
    }
  })
)

//persistent login sessions 
app.use(passport.session())