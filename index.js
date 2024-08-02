const express = require('express');
const {connectToMongoDB} = require('./connet');
const urlRouter = require('./routes/url');
const URL = require('./models/url');
const path = require('path');
const staticRouter = require('./routes/staticRouter');
const userRoute = require('./routes/user');
const cookiwParser = require('cookie-parser');
const {restrictToLoggedinUserOnly, checkAuth} = require('./middlewares/auth');

const app=express();
const PORT=8080;

connectToMongoDB('mongodb://localhost:27017/short-url')
.then(()=>{console.log('Connected to MongoDB');});

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookiwParser());

app.use('/url', restrictToLoggedinUserOnly, urlRouter);
app.use('/user',userRoute);
app.use('/', checkAuth, staticRouter);

app.get('/url/:shortId',async (req,res)=>{
    const shortId=req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {shortId},
        {$push:{visitHistory:{timestamp: Date.now()}}}
    );
    res.redirect(entry.redirectURL);
});


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});