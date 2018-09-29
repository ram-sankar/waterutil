var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//used to hash the password
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	phone: {
		type: Number
	}
});
var User =  mongoose.model('customers', UserSchema); //mongoose.model('table name','feild name')



module.exports = {
    User : User
}
