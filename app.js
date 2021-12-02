const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const errorController = require('./controllers/error');
const User = require('./models/user');
const flash = require('connect-flash');
const multer = require('multer');

const app = express();
const store = new MongoDBStore({
	uri:'mongodb+srv://darshan:msdhoni@cluster0.oantu.mongodb.net/Bookshopdatabase?retryWrites=true&w=majority',
	collection:'sessions'
})

const csrfProtection = csrf();
// const fileStorage = multer.diskStorage({
// 	destination: (req,file,cb)=>{
// 		cb(null,'images');
// 	},
// 	filename:(req,file,cb)=>{
// 		cb(null,new Date().toISOString()+'-'+file.originalname)
// 	}
// });
// const fileFilter = (req,file,cb)=>{
// 	if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
// 		cb(null,true);
// 	}else{
// 		cb(null,false);
// 	}
// }

app.set('view engine','ejs');
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended:true}));
//app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));
//app.use(express.static(path.join(__dirname,'public')));
//app.use('/public/images',express.static(path.join(__dirname,'images')));
app.use(express.static(__dirname + '/public'));

app.use(session({secret:'my secret',resave:false,saveUnitialized:false,store:store
				}));

//app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
	res.locals.isAuthenticated = req.session.isLoggedIn;
	//res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req,res,next)=>{
	if(!req.session.user){
		return next();
	}
    User.findById(req.session.user._id)
    .then(user=>{
		if (!user) {
        return next();
        }
        req.user=user;
        next();
    })
    .catch(err => {
      next(new Error(err));
    });
});


app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);
// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
// });

const port = process.env.PORT || 5000;
mongoose.connect("mongodb+srv://darshan:msdhoni@cluster0.oantu.mongodb.net/Bookshopdatabase?retryWrites=true&w=majority")
.then(result=>{
    console.log("Book shop started");
    app.listen(port,function(){
        console.log("Hello");
    });
})
.catch(error=>console.log(error.message));

// mongoose.connect("mongodb://localhost:27017/yelp_camp",{
// 	useNewUrlParser:true,
// 	useUnifiedTopology:true
// })
// .then(result => {
//     app.listen(3000, function(){
//     console.log("The Server Has Started!");
//  });
//  })
// .catch(error=>console.log(error.message));

