var map,geocoder,mapMarkers = [];
var emActList = [];
var markersFlag = 0;
var markerCurrentPos ={};
var listenerMapChange;
var mapCurrentZoom;
var currentUserInfo = {};

$(document).ready(function init() {
    var myLatlng = new qq.maps.LatLng(22.54027, 113.93457);
    var myOptions = {
        zoom: 12,
        center: myLatlng
    }
    var mapTest = document.getElementById("mapTest");
    map = new qq.maps.Map(mapTest, myOptions);

    var anchor = new qq.maps.Point(6, 6),
        size = new qq.maps.Size(24, 24),
        origin = new qq.maps.Point(0, 0),
        icon = new qq.maps.MarkerImage('img/center.gif', size, origin, anchor);
    markerCurrentPos = new qq.maps.Marker({
        icon :icon,
        map: map
    });
    geocoder = new qq.maps.Geocoder({
        complete : function(result){

            map.setCenter(result.detail.location);
            markerCurrentPos.position = result.detail.location;
            markerCurrentPos.setMap(null);
            markerCurrentPos.setMap(map);
            map.zoomTo(14);
        }
    });

    var btnAddAct = document.getElementById("btnAddAct");
    var formAddAct =document.getElementById("formAddAct");

    var btnCancleForm =$('#btnCancleForm');
    btnCancleForm.click(function(){
        $('#formAddAct')[0].reset();
    });

    var btnPostForm = $('#btnPostForm');
    btnPostForm.click(function(){
        if(validateForm()){
            postNewAct();

        }
    });

    var btnLocate = $('#btnLocate');
    btnLocate.click(function(){
        navigator.geolocation.getCurrentPosition(updateLocation);
    });

    var inputSearchLocate = $('#inputSearchLocate');
    var btnSearchLocate = $("#btnSearchLocate");
    btnSearchLocate.click(function(){
        codeAddress();
    });


    btnAddAct.onclick = function() {
        $('#myModal').modal('show');
    };
    $('#btnChooseLocate').click(function(){
        $('#myModal').modal('hide');
        addMapClick();
    });

    $('#btnReflash').click(function(){
        deleteOverlays(mapMarkers);
        emActList.length = 0 ;
        getCurrentActList2();
    });
    getCurrentActList2();

    //html5 定位当前位置
    // navigator.geolocation.getCurrentPosition(updateLocation);

    //实现缩放返回地图大小
   listenerMapChange = qq.maps.event.addListener(map, 'bounds_changed',mapChange );
   //界面的初始化

   //隐藏地图和操作
   // $('.map_wrap').hide();
   // $('.operators').hide();
   // $('#liLogout').click(function(){
   //     $.ajax({
   //          type : 'get',
   //          url  : '/logout',
   //          success : function(){
   //             $('.map_wrap').hide();
   //             $('.operators').hide();
   //             $('#liUsername').empty();
   //             $('#liLogout').empty();
   //             $('#divLogin').show();
   //             currentUserInfo.sponsorid = null;
   //          },
   //          error: function(XMLHttpRequest, textStatus, errorThrown) {
   //              alert(errorThrown);
   //          }
   //     })
   //     // $('.map_wrap').hide();
   //     // $('.operators').hide();
   //     // $('#liUsername').empty();
   //     // $('#liLogout').empty();
   //     // $('#divLogin').show();
   //     // currentUserInfo.sponsorid = null;
   // });
   // $('#btnLogin').click(function(event){
   //     event.preventDefault();
   //     if(validateLoginForm()){
   //         var username = $('#username').val();
   //         postLogin(username);
   //     }
   // });
});

//添加标记事件
function addMarker(location,content,actid) {

    var icon ;
    var iconEat = new qq.maps.MarkerImage('/img/eat.png');
    var iconSport = new qq.maps.MarkerImage('/img/sport.png');
    var iconELse = new qq.maps.MarkerImage('/img/play.png');
    var marker;
    if(content){
        if(content.tags =="MOIVE"){
            icon = iconSport;
        }else if (content.tags == "EAT"){
            icon = iconEat;
        }else{
            icon = iconELse;
        }
        marker = new qq.maps.Marker({
            position: location,
            icon :icon,
            map: map,
            animation:qq.maps.MarkerAnimation.DROP,
            actId : actid
        });
    }else{
        marker = new qq.maps.Marker({
            position: location,
            map: map,
            animation:qq.maps.MarkerAnimation.DROP,
            actId : actid
        });
    }


    qq.maps.event.addListener(marker, 'click', function(event) {
        var info = new qq.maps.InfoWindow({
            map: map
        });
        info.open();
        var marHtml = '<div style="width:150px;padding-top:10px;"><h1>活动简介</h1><table class="detail">'+
            '<tr><td  class="title">标题：</td><td class="content">'+ content.title +'</td></tr>'+
            '<tr><td class="title">人数：</td><td class="content">'+ content["num_people"]+'</td></tr>'+
            '<tr><td class="title">类型：</td><td class="content">'+ content.tags+'</td></tr></div>'
        info.setContent(marHtml);
        info.setPosition(event.latLng);
    });
    mapMarkers.push(marker);
    markersFlag++;
}
//添加地图标记事件（只能点击一次）
function addMapClick() {

    var listener;
    listener = qq.maps.event.addListener(
        map,
        'click',
        function(event) {
            addMarker(event.latLng);
            $("input[name='longitude']").val(event.latLng.lng);
            $("input[name='latitude']").val(event.latLng.lat);
            if (event) {
                qq.maps.event.removeListener(listener);
                $('#myModal').modal('show');
            }
        }
    );
}

//获取活动数据
function getActList() {
    $.ajax({
        type: "get",
        url: "http://203.195.164.190/v1/activity/search.php",
        data :{
            activityid : 2
        },
        success: function(data) {
            data = JSON.parse(data);
            emActList.push(data.data);
            //实现根据数据库返回数据向地图添加标注
            addMarkersByAct(emActList);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown);
        }
    })
}

//获取活动数据2
function getActList2() {
    $.ajax({
        type: "get",
        url: "http://203.195.164.190/v1/activity/search.php",
        data : {
            activityid : 1
        },
        success: function(data) {
            data = JSON.parse(data);
            emActList.push(data.data);
            //实现根据数据库返回数据向地图添加标注
            addMarkersByAct(emActList);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown);
        }
    })
}
//获取用户数据
function getUesrList() {
    $.ajax({
        type: "get",
        url: "http://203.195.164.190/v1/activity/search.php",
        data :{
            "username" : "songbo"
        },
        success: function(data) {
            console.log("未处理的数据类型 " + (typeof data));
            data = JSON.parse(data);
            console.log("处理后的数据类型 " + (typeof data));

            $("#activeList").append('<pre>' + data + '</pre>');
            emActList.push(data.data);
            console.log("现在所有的事件数组" + emActList);
            //实现根据数据库返回数据向地图添加标注
            addMarkersByAct(emActList);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown);
        }
    })
}

//获取活动数据3
function getCurrentActList1(){
    $.ajax({
        type : 'get',
        url : 'http://203.195.164.190/v1/activity/search.php',
        data : {
            minLat : "0",
            maxLat : "23",
            minLng : "0",
            maxLng : "120",
            detail : "0"
        },
        success : function(data){
            console.log(data);
            data = JSON.parse(data);
            console.log('当前的活动位置是');
            console.log(data);
        },
        error :function(XMLHttpRequest, textStatus, errorThrown){
            alert(errorThrown);
        }
    })
}
/*
    11.15修改
 */
function getCurrentActList2(){
    $.ajax({
        type : 'post',
//        url : 'test.json',
        url : '../test/getacts',
       data : {
           latitudeMin : "0",
           latitudeMax : "50",
           longitudeMin: "0",
           longitudeMax: "180"
           // detail : "1"
       },
        success : function(data){
            // data = JSON.parse(data);
            $(data.data).each(function(){
                emActList.push(this);
            });
            addMarkersByAct(emActList);
            map.zoomTo(map.zoom-1);
            map.zoomTo(map.zoom+1);
        },
        error :function(XMLHttpRequest, textStatus, errorThrown){
            alert(errorThrown);
        }
    })
}

//带参数的ajax调取活动方法
function getCurrentActList(){
    $.ajax({
        type : 'get',
        url : 'http://203.195.164.190/v1/activity/search.php',
        data : currentMapSize(),
        success : function(data){
            console.log(data);

            data = JSON.parse(data);
            console.log('当前的活动详情是');
            console.log(data);
            $(data.data).each(function(){
                emActList.push(this);
            })
            deleteOverlays(mapMarkers);
            addMarkersByAct(emActList);
        },
        error :function(XMLHttpRequest, textStatus, errorThrown){
            alert(errorThrown);
        }
    })
}
//用ajax方法发送活动数据
function postNewAct(){
    $.ajax({
        type : 'post',
        // url  : 'http://203.195.164.190/v1/startactivity.php',
        url:'/postnewact',
//        data : $('#formAddAct').serialize(),
        data : {
            'title' : $("input[name = 'title']").val(),
            'tags'  : $("select[name='tags']").val(),
            'start_time':$("input[name = 'start_time']").val().match(/\d+/g).join(""),
            'end_time'  : $("input[name = 'end_time']").val().match(/\d+/g).join(""),
            'addrname'  : $("input[name='addrname']").val(),
            'longitude' : $("input[name='longitude']").val(),
            'latitude' : $("input[name='latitude']").val(),
            'content' : $("input[name='content']").val(),
            'num_people' : $("input[name='num_people']").val(),
            'sponsorid' : currentUserInfo.sponsorid
        },
        success : function(){
            alert('添加新事件成功');
            $('#formAddAct')[0].reset();
            $('#myModal').modal('hide');
            deleteOverlays(mapMarkers);
            emActList.length = 0 ;
            getCurrentActList2();

        },
        error :function(XMLHttpRequest, textStatus, errorThrown){
            alert(errorThrown);
        }
    })
};

/*
    10.11修改

*/

// function postLogin(username){
//     $.ajax({
//         type : 'post',
//         url : '../reg',
//         data : $('#formLogin').serialize(),
//         success : function(data){
//             // data = JSON.parse(data);
//             if(data.data == '-1'){
//                 alert('用户重复');
//             }else{
//                 alert('登录成功');
//                 $('#divLogin').hide();
//                 $('.map_wrap').show();
//                 $('.operators').show();
//                 $('#liUsername').text(username);
//                 $('#liLogout').text('注销');
//                 $('#formLogin')[0].reset();
//                 currentUserInfo.sponsorid = data.data;
//             }
//         }
//     })
// }


// function postLogin(){
//     alert('登录成功');
//     $('#divLogin').hide();
//     $('.map_wrap').show();
//     $('.operators').show();
// //    $('#liUsername').text(username);
//     $('#liLogout').text('注销');
//     $('#formLogin')[0].reset();
// }
//根据数组向地图添加标注
function addMarkersByAct(Array){
    $(Array).each(function(){
        addMarker(new qq.maps.LatLng(this.addr.latitude,this.addr.longitude),this.detail,this.activityid);
    })
}

function updateLocation(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    markerCurrentPos.position = new qq.maps.LatLng(position.coords.latitude,position.coords.longitude);
    markerCurrentPos.setMap(null);
    markerCurrentPos.setMap(map);
    map.zoomTo(15);
    map.panTo(new qq.maps.LatLng(position.coords.latitude,position.coords.longitude));

}

function validateForm() {
    //validate方法参数可选
    return $("#formAddAct").validate({
        rules: {
            title : "required",
            content : "required",
            "num_people" : {
                required : true,
                number : true,
                max : 15
            },
            tags : "required",
            addrname : "required",
            "start_time" : "required",
            "end_time" : "required",
            latitude : "required",
            longitude : "required"
        },
        messages:{
        },
        errorPlacement: function(error, element) {
            // if the input has a prepend or append element, put the validation msg after the parent div
            if(element.parent().hasClass('input-prepend') || element.parent().hasClass('input-append')) {
                error.insertAfter(element.parent());
                // else just place the validation message immediatly after the input
            } else {
                error.insertAfter(element);
            }
        },
        errorElement: "small", // contain the error msg in a small tag
        wrapper: "div", // wrap the error message and small tag in a div
        highlight: function(element) {
            $(element).closest('.control-group').addClass('error'); // add the Bootstrap error class to the control group
        },
        success: function(element) {
            $(element).closest('.control-group').removeClass('error'); // remove the Boostrap error class from the control group
        }
    }).form();
}
// function validateLoginForm() {
//     return $('#formLogin').validate({
//         rules : {
//             username : "required",
//             contactinfo : "required"
//         },
//         messages : {
//             username : {
//                 required : "请输入用户名"
//             },
//             contactinfo : {
//                 required : "请输入联系电话"
//             }
//         }
//     }).form();
// }


function currentMapSize(){
    return  {
        maxLat : map.getBounds().lat.maxY,
        minLat : map.getBounds().lat.minY,
        maxLng : map.getBounds().lng.maxX,
        minLng : map.getBounds().lng.minX,
        detail :1
    }
}

// 转化文字为ip地址

function codeAddress() {
    var address = document.getElementById("inputSearchLocate").value;
    geocoder.getLocation(address);
}



function clearOverlays(markersArray) {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
    }
}

function showOverlays(markersArray) {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(map);
        }
    }
}

function deleteOverlays(markersArray) {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}

function currentScreenAct(position,actArray){
    var currentScreenActList = {};
    currentScreenActList.length = 0 ;
    $(actArray).each(function(){
        var lat = this.addr.latitude;
        var lng = this.addr.longitude;
        if(lat<position.maxLat&&lat>position.minLat&&lng<position.maxLng&&lng>position.minLng){
            if(!currentScreenActList[this.activityid]){
                currentScreenActList[this.activityid] = this;
                currentScreenActList.length++;
            }
        }
    });
    return currentScreenActList;
}

function currentScreenActHtml(currentScreenActList){
    var newElem,detailElem ;
    var divCurrentScreenAct = $('#divCurrentScreenAct');
    divCurrentScreenAct.empty();
    divCurrentScreenAct.append('<h1>当前屏幕范围内共有<b style="color :red">'+ currentScreenActList.length +'</b>个活动</h1>');
    divCurrentScreenAct.append('<table></table>');
    for( elem in currentScreenActList){
        if(elem !== 'length'){
            newElem =$('<tr class="activityItem">'+
                '<th><div class="icon" title="在图上显示该点"></div></th>'+
                '<td><div class="title"><a href="javascript:void(0)" onclick="return false;">'+ currentScreenActList[elem].detail["title"]+'</a></div>'+
                '联系方式：<span class="address">'+ currentScreenActList[elem].detail["start_time"] +'</span><br>'+
                '地址：<span class="tel">'+ currentScreenActList[elem].addr.addrname +'</span><br></td>'+
                '<td class="imageHolder"><img src="/img/feng.png" alt="Img">'+
                '</td></tr>');
            newElem.attr("id",currentScreenActList[elem]["activityid"]);
            newElem.click(function(event){
                event.preventDefault();
                qq.maps.event.removeListener(listenerMapChange);
                divCurrentScreenAct.empty();
                mapCurrentZoom = map.zoom;
                map.panTo(findMapMarker(this.id));
                map.zoomTo(16);
                var staTime = currentScreenActList[this.getAttribute("id")].detail["start_time"].toString();
                var endTime = currentScreenActList[this.getAttribute("id")].detail["end_time"].toString();
                detailElem = '<div><h1>活动详情</h1><table class="detail">'+
                    '<tr><td class="title">活动主题：</td><td class="content">'+ currentScreenActList[this.getAttribute("id")].detail.title +'</td></tr>'+
                    '<tr><td class="title">开始时间：</td><td class="content">'+ staTime.slice(0,4)+'年'+staTime.slice(4,6)+'月'+staTime.slice(6,8)+'日'+
                    staTime.slice(8,10)+'时'+staTime.slice(10,12)+'分'+'</td></tr>'+
                    '<tr><td class="title">结束时间：</td><td class="content">'+ + endTime.slice(0,4)+'年'+endTime.slice(4,6)+'月'+endTime.slice(6,8)+'日'+
                    endTime.slice(8,10)+'时'+endTime.slice(10,12)+'分'+'</td></tr>'+
                    '<tr><td class="title">联系方式：</td><td class="content">'+currentScreenActList[this.getAttribute("id")].detail.liLogout+'</td></tr>'+
                    '<tr><td class="title">活动描述：</td><td class="content">'+ currentScreenActList[this.getAttribute("id")].detail["content"] +'</td></tr>'+
                    '<tr><td class="title">需要人数：</td><td class="content">'+ currentScreenActList[this.getAttribute("id")].detail["num_people"] +'</td></tr>'+
                    '<tr><td class="title">活动地点：</td><td class="content">'+ currentScreenActList[this.getAttribute("id")].addr.addrname +'</td></tr></table>'+
                    '<button class="btn btn-danger btn-return" onclick="mapChange1()">返回列表详情</button></div></div>'

                divCurrentScreenAct.append(detailElem)
            });
            $('#divCurrentScreenAct > table').append(newElem);
        }
    }

}

function mapChange(){
    var currentScreenActList=currentScreenAct(currentMapSize(),emActList)
    currentScreenActHtml(currentScreenActList);
}

function mapChange1(){
    listenerMapChange = qq.maps.event.addListener(map, 'bounds_changed',mapChange );
    map.zoomTo(mapCurrentZoom);
    var currentScreenActList=currentScreenAct(currentMapSize(),emActList)
    currentScreenActHtml(currentScreenActList);

}
function findMapMarker(actId){
    var latLng ;
    var pos = null;
    $(mapMarkers).each(function(){
        if(this.actId == actId){
            latLng = new qq.maps.LatLng(this.position.lat,this.position.lng);
            return pos = this.position;
        }
    })
    return pos;
}