var express = require('express');
var bp = require('body-parser');
var path = require('path');

var exprValidator = require('express-validator');

// Check out mongoose version 4.7.2 also.
// Later versions have a strange bug about converting string of numbers
// into ObjectId ready for the database queries.
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);

var app = express();

// Custom middleware
// 
/*
var logger = function(req,res,next) {
	console.log('Logging...');
	next();
};

app.use(logger);
*/

// EJS template
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));

// Body Parser middleware
app.use(bp.json());
app.use(bp.urlencoded({extended: false}));


// Set Static content and path
app.use(express.static(path.join(__dirname, 'public')));

// Express Validator middleware
app.use(exprValidator({
	errorFormatter: function(param,msg,value) {
		var namespace = param.split('');
		var root = namespace.shift();
		var formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}

		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// middleware.. This is the way to allocate gloal variables available in the response.
// In this case I need it coz EJS expect every variable to be declared
// at the compilation time. In other words, I cannot check with "if(errors)"
// if errors variable is undefined.
app.use(function(req,res,next) {
	res.locals.errors = null;
	next();
});

// In a production environment, I would use a User model separately
var users;


// Get route for /
app.get('/', function(req,res) {
	// We can pass values to the view
	db.users.find(function(err,docs) {
		if(err) {
			console.log(err);
		}
		else {
			users = docs;
		//console.log(res.locals.errors);
			res.render('index', {
				title: 'Customers',
				users: users
			});
		}
	});
	/*
	res.render('index', {
		title: 'Customers',
		users: users
	});
	*/
});


// Post for adding a user
app.post('/users/add', function(req,res) {
	//'use strict';
	req.checkBody('first_name','First name is Required').notEmpty();
	req.checkBody('last_name','Last name is Required').notEmpty();
	req.checkBody('email','Email is Required').notEmpty();
	req.checkBody('email','Email format is not valid.').isEmail();

	req.getValidationResult()
	.then(function(result) {
                if (result.isEmpty()) {
                        var newUser = {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email: req.body.email
                        };
                        db.users.insert(newUser, function(err, result) {
                        	if(err) {
                        		console.log(err);
                        	}
                        	res.redirect('/');
                        });
                }
                else {
                		//console.log(res.locals.errors, result.array());
                		//errors = result.array();
                		//console.log('\n\n' + res.locals.errors);
                		var errors = result.array();
                		res.render('index', {
                			title: 'Customers',
                			users: users,
                			errors: errors
                		});
                }
        });
});

app.delete('/users/delete/:id', function(req,res) {
	//console.log(req.params.id + ' ' + typeof req.params.id);
	var id = req.params.id;
	db.users.remove({_id: mongojs.ObjectId(id)}, function(err, result) {
		if(err) {
			console.log(err + 'heey');
		}
		res.redirect('/');
	});
});




app.listen(3000, function() {
	console.log("Server started on port 3000...");
});
