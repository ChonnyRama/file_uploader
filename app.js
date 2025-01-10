//app.js
const path = require("node:path")
const express = require("express")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
require('dotenv').config();
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const userRouter = require("./routes/userRouter")
const { gracefulShutdown } = require("./controllers/userController")
const fileRouter = require("./routes/fileRouter")
const { v2:cloudinary } = require('cloudinary')


//create express application
const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath))

const prisma = new PrismaClient()

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = cloudinary

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
      prisma,
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
      const user = await prisma.user.findUnique({
        where: {
          username: username
        }
      })

      if (!user) {
        return done(null,false,{message: 'incorrect username'})
      }

      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return done(null,false, {message: 'incorrect password'})
      }
      return done(null,user)
    } catch (err) {
      return done(err)
    }
  })
)

//persistent login sessions 
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null,user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    })

    done(null,user)
  } catch (err) {
    done(err)
  }
})

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next()
})

app.post("/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
)

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
  if (err) {
    return next(err)
  }
  res.redirect("/")
})
})

app.use('/', userRouter)
app.use('/files', fileRouter)

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await gracefulShutdown(() => {
    console.log("Application shutdown complete.");
    process.exit(0);  // Ensure the process exits cleanly
  });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log("app listening on port 3000"))