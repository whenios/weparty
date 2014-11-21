var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Acts = require('../models/acts');
var ejs = require('ejs');
/* GET home page. */
router.get('/', function(req, res) {
	console.log(req.session.user);
	if(req.session.user!=null){
		res.render('content',{'user':req.session.user});
	}else{
		res.render('index',{'user':null});
	}
});

// router.get('/content',function(req,res){
// 	if (req.session.user !=null ) {
// 		res.render('content',{'user':req.session.user,''});
// 	}else{
// 		res.redirect('/');
// 	}
// })
router.get('/wh',function(req,res){
	console.log(req.session);
	req.session.username = "wh";
	res.cookie('name','wwwh');
	res.cookie('age','22');
	res.clearCookie('name');
	// res.send('wh is good !');
	res.redirect('/');
})

router.post('/reg',function(req,res){
	console.log(req.session);
	var name = req.body.username;
	var phoneNumber = req.body.contactinfo;
	var newUser = new User({
		name:name,
		phoneNumber:phoneNumber
	});
	User.get(newUser.name,function(err,user){
		if(user){
			if(user.phoneNumber == phoneNumber){
				console.log(user);
				req.session.user = user ;
				console.log(req.session);
				// return res.render('content',{'user':user});
				// req.flash('info',1);
				// return res.redirect('/');
				return res.json({data:1})
			}else{
				return res.json({data:0})
				// return req.flash('error','duplicated user');
				// return res.redirect('/');
			}
		}
		newUser.save(function(err,user){
			if(err){
				console.log(err);
				// console.log(user);
				// return req.flash('error','duplicated user');
				// req.flash('info',0);
				// return res.redirect('/');
				return res.json({data:0});
			}

			console.log(user);
			req.session.user = user;
			// // return res.json('content',{'user':user})
			// req.flash('info',0);
			// return res.redirect('/');
			return res.json({data:1});
		})
	})
})

router.get('/logout',function(req,res){
	req.session.user = null;
	// return res.json({data:0});
	return res.redirect('/');
})
router.post('/test/getuserbyid',function(req,res){
	User.getById(Number(req.body.id),function(err,user){
		if(err){
			console.log(err);
		}
		if(user){
			return res.json({data:user});
		}else{
			return res.json({data:-1});
		}
	})
})

router.post('/postnewact',function(req,res){
	// console.log(123);
	console.log(req.body);
	console.log(typeof req.body);
	var act = req.body;
	console.log(req.body.lonitude);
	console.log(act);
	var newAct = new Acts(act);
	console.log(111);
	newAct.save(function(err,act){
		if(err){
			console.log(err);
			return res.json({meta:200});
		}
		if(act){
			console.log(act);
			return res.json({data:0});
		}		
	});
})

router.post('/test/getacts',function(req,res){
	var addr = req.body;
	Acts.getByAddr(addr,function(err,acts){
		if(err){
			console.log(err);
		}
		console.log(acts);
		return res.json({data:acts});
	})
})

router.get('/test/index',function(req,res){
	return res.render('index');
})

router.get('/indextest',function(req,res){
	return res.render('index');
})

function checkLogin(req,res,next){
	if(!req.session.user){
	
	}
}

function checkNotLogin(req,res,next){
	if(req.session.user){

	}
}
module.exports = router;

