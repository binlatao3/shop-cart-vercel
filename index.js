const express = require('express');
const createError = require('http-errors');
const exphbs = require('express-handlebars');
const flash = require('express-flash')
const session = require('cookie-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const passport = require('passport');
const app = express();
const reduceOp = function(args, reducer){
    args = Array.from(args);
    args.pop(); // => options
    var first = args.shift();
    return args.reduce(reducer, first);
  };

  
const hbs = exphbs.create({
    helpers: {
      compare: function(value1,operator,value2,options) {
          var operators = {
              'eq': function(l,r) { return l === r; },
              'noteq': function(l,r) { return l !== r; },
              'gt': function(l,r) { return Number(l) > Number(r); },
              'or': function(l,r) { return l || r; },
              'and': function(l,r) { return l && r; },
              '%': function(l,r) { return (l % r) === 0; }
            }

            result = operators[operator](value1,value2);
            
            if (result) return options.fn(this);
            else  return options.inverse(this);
      },
      eq  : function(){ return reduceOp(arguments, (a,b) => a === b); },
      ne  : function(){ return reduceOp(arguments, (a,b) => a !== b); },
      lt  : function(){ return reduceOp(arguments, (a,b) => a  <  b); },
      gt  : function(){ return reduceOp(arguments, (a,b) => a  >  b); },
      lte : function(){ return reduceOp(arguments, (a,b) => a  <= b); },
      gte : function(){ return reduceOp(arguments, (a,b) => a  >= b); },
      and : function(){ return reduceOp(arguments, (a,b) => a  && b); },
      or  : function(){ return reduceOp(arguments, (a,b) => a  || b); },
      sub  : function(){ return reduceOp(arguments, (a,b) => parseInt(a)  - parseInt(b)); },
      isNumber : function(value,options) {
        const pattern = /^\d+$/;
        if (pattern.test(value)) 
        {
            return options.fn(this);
        } 
        else 
        {
            return options.inverse(this);
        }
      },
      repeat: function(start, end, block) {
        let accum = '';
        for (let i = start; i <= end; ++i) {
          accum += block.fn(i);
        }
        return accum;
      },
      inc : function(value, options)
      {
          return parseInt(value) + 1;
      },
      addDos : function(value)
      {
          value += '';
          x = value.split('.');
          x1 = x[0];
          x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
              x1 = x1.replace(rgx, '$1' + '.' + '$2'); // changed comma to dot here
          }
          return x1 + x2;
      },
      dateFormat: function(value)
      {
            if(value)
            {
                var today = new Date(value);
                var value = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
                if(today.getHours() >= 12)
                {
                    return value + ' '+ time + ' '+  "PM"
                }
                else
                {
                    return value + ' '+ time + ' '+  "AM"
                }
            }
            else
            {
                var today = new Date();
                var value = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var value = today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
                if(today.getHours() >= 12)
                {
                    return value + ' '+ time + ' '+  "PM"
                }
                else
                {
                    return value + ' '+ time + ' '+  "AM"
                }
            }
      },
      linkProduct: function(value){
        if(value)
        {
            return value.toLowerCase().replace(/ /g,'-')
        }
      },
      downLine: function(value){
        if(value)
        {
            if(value)
            {
                let breakline = []
                let line = value.split('\n')
                for(var i = 0;i < line.length;i++)
                {
                    breakline +=  "<p style='text-align: justify;'>" + line[i].replace('\r','') + "</p>";
                }
                return breakline
            }
        }
      },
  },
    defaultLayout: false,
    partialsDir: ['views'],
    extname: 'hbs'
  });
app.engine('hbs',hbs.engine)
app.set('trust proxy', 1);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','hbs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser('ShopCart'));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "secret",
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.destroy) {
        request.session.destroy = (cb) => {
          request.session = null;
        };
    }
    next()
})

passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    return cb(null, obj);
});

  
// db
const db = require('./db')

const indexRouter = require('./routes/home');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const adminRouter = require('./routes/admin')
const storeRouter = require('./routes/store');
const facebookRouter = require('./middleware/auth/facebook-auth');

// var signupRouter = require('./routes/signup');

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/admin', adminRouter);
app.use('/store',storeRouter);
app.use('/auth/facebook', facebookRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

  
app.listen(3000, () => {
    console.log(`Listening at http://localhost:3000`);
});