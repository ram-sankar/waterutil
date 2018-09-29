var mongoose = require('mongoose');


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
	},
    amount: {
      type: Number
    }
});
var User =  mongoose.model('customers', UserSchema); //mongoose.model('table name','feild name')



module.exports = {
    User : User
}

