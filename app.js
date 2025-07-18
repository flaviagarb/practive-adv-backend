import createError from "http-errors";
import express from 'express';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import connectMongoose from './lib/connectMongoose.js';
import i18n from './lib/i18nConfigure.js';
import upload from './lib/uploadConfigure.js';
import 'dotenv/config'


import homeRouter from './routes/home.js'
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import { fileURLToPath } from 'url';
import * as sessionManager from './lib/sessionManager.js';
import * as localeController from './controllers/localeController.js';
import * as apiProductsController from './controllers/api/apiProductsController.js';
import * as apiLoginController from './controllers/api/apiLoginController.js';
import * as jwtAuth from './lib/jwtAuthMiddleware.js';
import swaggerMiddleware from './lib/swaggerMiddleware.js';


await connectMongoose() // top level await thanks to ES Modules
console.log('Connected to MongoDB');

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.title = 'Nodepop';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// public: acceder directamente desde navegador ; path.join correcto desde cualquier SO ; __dirname ubicacion del archivo actual
app.use(express.static(path.join(__dirname, 'public')));

// swagger UI
app.use('/api-doc', ...swaggerMiddleware);

// api routes

app.post('/api/login', apiLoginController.loginJWT)
app.get('/api/products', jwtAuth.guard, apiProductsController.list)
app.get('/api/products/:productId', jwtAuth.guard, apiProductsController.getProductById);
app.post('/api/products', jwtAuth.guard, upload.single('image'), apiProductsController.createProduct);
app.put('/api/products/:productId', jwtAuth.guard, upload.single('image'), apiProductsController.update)
app.delete('/api/products/:productId', jwtAuth.guard, apiProductsController.deleteProduct)

// esto es importante: va en orden de prioridades
app.use(i18n.init)
app.get('/change-locale/:locale', localeController.changeLocale);
app.use(sessionManager.middleware);
app.use(sessionManager.useSessionInViews); // creamos sessionManager.js
app.use('/', homeRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/auth', authRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


export default app;
