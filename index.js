const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = require('express')();
const passport = require('passport');
const cors = require('cors');
const { buildContext } = require('graphql-passport');
const session = require('express-session');

app.use(cors({
  origin: true,
  methods: 'POST, GET, OPTIONS', 
  credentials: true
}));

/** Session middleware to create and parse cookies */
const sessionMiddleware = session({
  secret: process.env.SESS_SECRET || "not really a secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
});

passport.use(require('./utils/localStrategy'));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const { Subject } = require('rxjs');
const { ApolloServer } = require('apollo-server-express');
const { AuthenticationError } = require('apollo-server');
const { mergeSchemas, makeExecutableSchema } = require('graphql-tools');

let schemas = [];
let gitHubSchema = null;
let server = null;

/** Subject that will be used to notify the controller to update the schema 
 * @type {Subject} */
const subject = new Subject();

const GitHubSchemaController = require('./controllers/GitHubSchemaController').controller;
/** Instance of GitHubSchemaController to manage and create GitHub schema used for stitching  */
const controller = new GitHubSchemaController('https://api.github.com/graphql', subject);

const multer = require('multer');
const fileFilter = require('./utils/fileFilter');
const upload = multer({ storage: require('./utils/diskStorage'), fileFilter });
const fs = require('fs');

app.post('/avatar', upload.single('avatar'), (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'File uploaded',
    pictureUrl: req.file.filename
  })
});

app.get('/avatar/:hex', (req, res) => {
  const { hex } = req.params;
  try {
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(`${process.env.STORAGE_DIR}/avatars/${hex}`);
  } catch {
    res.setHeader('ContentType', 'application/json');
    res.status(404).json({
      status: 404,
      message: 'File not found'
    })
  }
});

/** Initialization of server, will be called by throng 
 * @async
 * @function start */
const start = async () => {
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok!'
    })
  });

  /** Uses the GitHub schema controller to create it and stitch it with Electra's schema 
   * @async 
   * @function initSchemas */
  const initSchemas = async () => {
    if(server) server.stop();
    gitHubSchema = await controller.createGHSchema('https://api.github.com/graphql', subject);
    schemas = [];

    const { typeDefs } = require('./schemas/electra.schema');
    const electraResolvers = require('./resolvers/index').resolvers;

    const { linkTypeDefs } = require('./schemas/extensions.schema');
    const linkResolvers = require('./resolvers/gitHub').getResolvers(gitHubSchema);

    const electraSchema = makeExecutableSchema({
      typeDefs,
      resolvers: electraResolvers
    });

    schemas.push(electraSchema);
    schemas.push(gitHubSchema);
    schemas.push(linkTypeDefs);
    
    const mainSchema = mergeSchemas({
      schemas,
      ...linkResolvers
    });

    server = new ApolloServer({ 
      schema: mainSchema,
      introspection: true,
      playground: true,
      debug: true,
      tracing: true,
      context: ({ req, res }) => ({
        headers: req.headers,
        ...buildContext({ req, res })
      }),
      formatError: (err) => (err.message === 'Response not successful: Received status code 401' ? new AuthenticationError('GitHub token not valid.') : err)
    });

    server.applyMiddleware({ app, path: '/', cors: false });
  }

  subject.subscribe({
    next: initSchemas
  });
  subject.next();

  app.listen({ port }, () => { console.log(`Listening on port ${port}`) });
}

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);