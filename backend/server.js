const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.get('/accounts/verify-email', (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).send('Token is required');
    
    const accountService = require('./accounts/account.service');
    accountService.verifyEmail({ token })
        .then(() => res.send('Email verification successful! You can now login.'))
        .catch(error => res.status(400).send('Verification failed: ' + error));
});

app.get('/account/verify-email', (req, res) => {
    res.redirect(`/accounts/verify-email?token=${req.query.token}`);
});

app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/api-docs', require('./_helpers/swagger'));
app.use(errorHandler);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));