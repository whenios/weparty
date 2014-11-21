var mongodb = require('./dbs');
function User(user){
	this.name = user.name;
	this.phoneNumber = user.phoneNumber;
}

module.exports = User;

User.prototype.save = function(callback){	
	var user = {
		name : this.name,
		phoneNumber :this.phoneNumber,
	};
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		var idIndex = db.collection('idIndex');
		idIndex.findAndModify(
			{name:"user"},[],{$inc:{id:1}},{upsert:true,new:false},
			function(err,result){
				console.log(result);
				user.id = result.id;		
				db.collection('users',function(err,collection){
					if(err){
						mongodb.close();
						return callback(err);
					}
					collection.insert(user,{
						safe:true
					},function(err,user){
						mongodb.close();
						if(err){
							callback(err);
						}
						callback(null,user[0]);//成功！err 为 null，并返回存储后的用户文档
					});
				});
			}
		)
	});
};

User.get = function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			db.close();
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				name : name
			},function(err,user){
				db.close();
				if(err){
					
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
}
User.getById = function(id,callback){
	mongodb.open(function(err,db){
		if(err){
			db.close();
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				db.close();
				return callback(err);
			}
			collection.findOne({"id":id},{"_id":0},function(err,user){
				db.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	})
}


