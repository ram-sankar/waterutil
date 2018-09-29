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




var dailydata = mongoose.Schema({
	sno: {
		type: Number,
		index:true
	},
    amount: {
      type: Number
    }
});
var daily =  mongoose.model('ram_dailies', dailydata);



var waterlevel = mongoose.Schema({
	sno: {
		type: Number,
		index:true
	},
    dist: {
      type: Number
    }
});
var water =  mongoose.model('water_level', waterlevel);





module.exports = {
    User : User,
    daily : daily,
    water : water
}

