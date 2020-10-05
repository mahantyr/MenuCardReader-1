'use strict';

var db = require('../db/firebase-context');

exports.get_menu_type = function(req, res) {
    console.log("HTTP Get Menu Type Request");
    var restname = req.params.restName;
    var menutypes = [];
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
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
        return res.send(menutypes);
    });
  };




  exports.get_item_by_type = function(req, res) {
    console.log("HTTP Get Item by Type Request");
    var restname = req.params.restName;
    var reqtype = req.params.type;
    var lst = [];
    var response = '';
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
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
        return res.send(response);
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
    var flag = 1;
    var menuReference = db.ref("/Eateries");
    
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        restaurant.forEach(function(item){
            if(item.Eatery.name==restname)
            {

                    // console.log('Loop1');
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        if(type.indexOf(reqtype)>-1)
                        {
                        
                                // console.log('Loop2');

                                var dict = {};
                                dict['name'] = name;
                                dict['price'] = price;
                                dict['description'] = description;
                                if(name == null || price == null || description == null){
                                    flag = 0;
                                    res.send('Request body argument contains undefined in property or wrong request body given');
                                }
                                item.Eatery.Menus[i].Menu.Items.push(dict);
                                // console.log(lst);
                                lst = restaurant;
                                restname = '';

                                
                        }
                    }
                
            }
        });
        // res.send(lst);
        // console.log("test");
        // console.log(flag);
        if (flag == 1){
            flag = 0;
            menuReference.set(lst, 
                function(error) {
                    var str = '';
                if (error) {
                    str = "Data could not be saved.\n" + error;
                } 
                else {
                    str = "Data saved successfully.\n";
                    
                }
                
                // menuReference.off("value", listener);
                res.send(str);
            });
        }
        else{
            // console.log('Stop');
           
            return;
        }
        
        
    });
    
    

  };

    exports.delete_item_in_type = function(req, res) {
    console.log("HTTP Get Item by Type Request");
    var name = req.body.name;


    var restname = req.params.restName;
    var reqtype = req.params.type;
    var lst = [];
    var flag = 1;
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        restaurant.forEach(function(item){
            if(item.Eatery.name==restname)
            {

                    // console.log('Loop1');
                    var found = 0;
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        if(type.indexOf(reqtype)>-1)
                        {
                            if(name == null || price == null || description == null){
                                flag = 0;
                                res.send('Request body argument contains undefined in property or wrong request body given');
                            }
                                
                                for (var j = 0; j < item.Eatery.Menus[i].Menu.Items.length; j++) {
                                    var itemName = item.Eatery.Menus[i].Menu.Items[j].name;
                                    if(itemName.indexOf(name)>-1){
                                        item.Eatery.Menus[i].Menu.Items.splice(j, 1);
                                        found = 1;
                                        // console.log('Loop Del');
                                    }
                                }
                                lst = restaurant;
                        }
                    }
                    if (found == 0){
                        flag=0;
                        res.send("Item not found in database");
                    }
            }
        });
        // console.log("test");
        // console.log(flag);
        if (flag == 1){
            flag = 0;
            menuReference.set(lst, 
                function(error) {
                if (error) {
                    res.send("Data could not be deleted.\n" + error);
                } 
                else {
                    res.send("Data deleted successfully.\n");
                }
            });
        }
        else{
            console.log('Stop');
            return;
        }
        
        
    });
    
    

  };
