var mongodb = require('./dbs');

function Acts(act){
    this.addr = {};
    this.detail = {};
	this.addr.longitude = Number(act.longitude);
    this.addr.latitude = Number(act.latitude);
    this.addr.addrname = act.addrname;
    this.detail.tags = act.tags;
    this.detail["start_time"] = Number(act["start_time"]);
    this.detail["end_time"] = Number(act["end_time"]);    
    this.detail.content = act.content;
    this.detail["num_people"] = Number(act["num_people"]);
    this.detail.sponsorid = Number(act.sponsorid);
    this.detail.title = act.title;
} 

Acts.prototype.save = function(callback){
    var act = {}
    act.detail = this.detail;
    act.addr = this.addr;
    mongodb.open(function(err,db){
        db.collection('idIndex',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findAndModify(
                {name:"act"},
                [],
                {$inc:{id:1}},
                {new:false,upsert:true},
                function(err,result){
                    if(err){
                        mongodb.close();
                         return callback(err);
                    }
                    db.collection('acts',function(err,collection){
                        if(err){
                            mongodb.close();
                            callback(err);
                        }
                        act.activityid = result.id;
                        collection.insert(act,{safe:true},function(err,act){
                            mongodb.close();
                            if(err){
                                callback(err);
                            }
                            callback(null,act[0]);
                        })
                    })
                }
            )
        })     
    })
}

Acts.getByAddr = function(addr,callback){
    mongodb.open(function(err,db){
        if(err){
            db.close();
            return callback(err);
        }
        db.collection('acts',function(err,collection){
            collection.find(
                {
                    "addr.longitude":
                        {
                            $gte:Number(addr.longitudeMin),
                            $lte:Number(addr.longitudeMax)
                        },
                    "addr.latitude":
                        {
                            $gte:Number(addr.latitudeMin),
                            $lte:Number(addr.latitudeMax)
                        }
                },{_id:0}).toArray(function(err,docs){
                    if(err){
                        return callback(err);
                    }
                    db.close();
                    console.log(docs.length);
                    callback(null,docs);
            })          
        })
    })
}
module.exports = Acts;

//     var user = {
//         name : this.name,
//         phoneNumber :this.phoneNumber
//         // _id : db.collection('idIndex')
//     };
//     mongodb.open(function(err,db){
//         if(err){
//             mongodb.close();
//             return callback(err);
//         }
//         db.collection('users',function(err,collection){
//             if(err){
//                 mongodb.close();
//                 return callback(err);
//             }
//             collection.insert(user,{
//                 safe:true
//             },function(err,user){
//                 mongodb.close();
//                 if(err){
//                     callback(err);
//                 }
//                 callback(null,user[0]);//成功！err 为 null，并返回存储后的用户文档
//             });
//         });
//     });
// };


//  'title' : $("input[name = 'title']").val(),
//             'tags'  : $("select[name='tags']").val(),
//             'start_time':$("input[name = 'start_time']").val().match(/\d+/g).join(""),
//             'end_time'  : $("input[name = 'end_time']").val().match(/\d+/g).join(""),
//             'addrname'  : $("input[name='addrname']").val(),
//             'longitude' : $("input[name='longitude']").val(),
//             'latitude' : $("input[name='latitude']").val(),
//             'content' : $("input[name='content']").val(),
//             'num_people' : $("input[name='num_people']").val(),
//             'sponsorid' : currentUserInfo.sponsorid

// {
//             "activityid": "15",
//             "addr": {
//                 "longitude": "113.934574",
//                 "latitude": "22.558062",
//                 "addrname": "广东省深圳市南山区南海大道朗山路28号"
//             },
//             "detail": {
//                 "title": "去pub！",
//                 "content": "去看妹纸！",
//                 "start_time": "201408072200",
//                 "end_time": "201408080600",
//                 "tags": "play",
//                 "num_people": "10",
//                 "status": "employ",
//                 "sponsorid": "2",
//                 "participants": "dylan|young",
//                 "ppcontactinfo": "7777777|1212",
//                 "ppstatus": "1|1"
//             }
//         },

