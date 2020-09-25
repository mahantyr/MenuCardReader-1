'use strict';

var db = require('../db/firebase-context');

exports.get_menu_type = function(req, res) {
    console.log("HTTP Get Menu Type Request");
    var restname = req.params.restName;
    var menutypes = [];
    var menuReference = db.ref("/Eateries");
    menuReference.on("value", snap => {
        var restaurant= snap.val();
        restaurant.forEach(function(item){
            if(item.Eatery.name==restname)
            {
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        menutypes.push(type);
                    }
                
            }
        });
        console.log(menutypes);
        res.json(menutypes);
    });
  };




  exports.get_item_by_type = function(req, res) {
    console.log("HTTP Get Item by Type Request");
    var restname = req.params.restName;
    var reqtype = req.params.type;
    var lst = [];
    var response = '';
    var menuReference = db.ref("/Eateries");
    menuReference.on("value", snap => {
        var restaurant= snap.val();
        restaurant.forEach(function(item){
            if(item.Eatery.name==restname)
            {

                    console.log(item);
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        if(type.indexOf(reqtype)>-1)
                        {
                        
                            for(var j=0;j<item.Eatery.Menus[i].Menu.Items.length;j++)
                            {
                                var dict = {};
                                dict['name'] = item.Eatery.Menus[i].Menu.Items[j].name;
                                dict['price'] = item.Eatery.Menus[i].Menu.Items[j].price;
                                dict['description'] = item.Eatery.Menus[i].Menu.Items[j].description;
                                lst.push(dict);
                                response =lst;
                            }
                        
                        }
                    }
                
            }
        });
        res.json(response);
    });
  };

  exports.add_item_by_type = function(req, res) {
    console.log("HTTP Get Item by Type Request");
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;


    var restname = req.params.restName;
    var reqtype = req.params.type;
    var lst = [];
    var response = '';

    var menuReference = db.ref("/Eateries");
    menuReference.on("value", snap => {
        var restaurant= snap.val();
        restaurant.forEach(function(item){
            if(item.Eatery.name==restname)
            {

                    console.log('Loop1');
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        if(type.indexOf(reqtype)>-1)
                        {
                        
                                console.log('Loop2');

                                var dict = {};
                                dict['name'] = name;
                                dict['price'] = price;
                                dict['description'] = description;
                                item.Eatery.Menus[i].Menu.Items.push(dict);
                                // console.log(lst);
                                lst = restaurant;
                                
                        }
                    }
                
            }
        });
        res.send(lst);
        console.log("test");
        menuReference.set(lst, 
            function(error) {
            if (error) {
                res.send("Data could not be saved.\n" + error);
            } 
            else {
                res.send("Data saved successfully.\n" + response);
            }
        });
        
        
    });
    
    

  };