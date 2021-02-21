'use strict';

var {performance} = require('perf_hooks');
var db = require('../db/firebase-context');

function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;
        if(d > 0){
            var r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {
            var r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

//Get Eatery IDs
exports.get_eatery_id = function(req, res) {
    console.log("HTTP Menu Type Request");
    var restname = req.params.restName.toLowerCase();
    var restid = '';
    var flag = 0;
    try{
        var menuReference = db.ref("/Eateries");
        menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.name.toLowerCase()==restname)
            {
                restid = item.Eatery.id; 
                flag = 1;           
            }
        });

            if(flag){
                return res.send(restid); 
            }
            else{
                return res.send("Eatery not present");
            }
        
        });
    }
    catch (err){
        res.send('Error in firebase');
    }  
};

//Get types of menu offered
exports.get_menu_type = function(req, res) {
    console.log("HTTP Menu Type Request");
    var restID = req.params.restNameID;
    var menutypes = [];
    var flag = 0;
    try{
        var menuReference = db.ref("/Eateries");
        menuReference.once("value", snap => {
            var restaurant= snap.val();
            if(restaurant==null){
                return res.send('Error in firebase');
            }
            restaurant.forEach(function(item){
                if(item.Eatery.id==restID)
                {
                        for (var i = 0; i < item.Eatery.Menus.length; i++) {
                            var type = item.Eatery.Menus[i].Menu.Type;
                            menutypes.push(type);
                        }
                        flag = 1;
                }
            });

            if(flag){
                return res.send(menutypes);
            }
            else{
                return res.send("Invalid Eatery ID");
            }
        });
    }
    catch (err){
        res.send('Error in firebase');
    } 
  };

//Add type in eatery
exports.add_menu_type = function(req, res) {
    console.log("HTTP Item by Type Request");
    var start = req.body.start;
    var end = req.body.end;
    var typename = req.body.type;
    var desc = req.body.description;
    var name = req.body.name;
    var price = req.body.price;
    var id = generateUUID();
    var itemid = generateUUID();


    var restID = req.params.restNameID;
 
    var lst = [];
    var response = '';
    var flag = 0;
    var menuReference = db.ref("/Eateries");
    try{
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.id==restID)
            {
                    flag = 1;
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type;
                        //console.log(type);
                        if(type == typename)
                        {
                            flag = 0;    
                        }
                    }

                    var dict = {};
                    dict['Type'] = typename;
                    dict['StartTime'] = start;
                    dict['EndTime'] = end;
                    dict['Items'] = [{"description":desc, "name":name, "price":price, "id":id}];
                    dict['id'] = itemid;
                    item.Eatery.Menus.push({'Menu':dict});
                    lst = restaurant;               
            }
        });

        if (flag == 1){
            // flag = 0;
            menuReference.set(lst, 
                function(error) {
                    var str = '';
                if (error) {
                    str = "Data could not be saved.\n" + error;
                } 
                else {
                    str = "Data saved successfully.\n Newly added item ID is- "+itemid;
                    
                }
                return res.send(str);
            });
        }
        else{
            return res.send("Data could not be saved. This could be beacuse of any of these:\nCheck the request ID\nMenu Type already exists.");
        }
        
        
    });
    }

    catch (err){
        res.send('Error in firebase');
    }
};



//Get the items offered for a particular type in eatery
  exports.get_item_by_type = function(req, res) {
    console.log("HTTP Item by Type Request");
    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var lst = [];
    var response = '';
    try{
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.id==restID)
            {

                    //console.log(item);
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                        if(type === reqtype)
                        {
                        
                            for(var j=0;j<item.Eatery.Menus[i].Menu.Items.length;j++)
                            {
                                var dict = {};
                                dict['name'] = item.Eatery.Menus[i].Menu.Items[j].name;
                                dict['price'] = item.Eatery.Menus[i].Menu.Items[j].price;
                                dict['description'] = item.Eatery.Menus[i].Menu.Items[j].description;
                                dict['id'] = item.Eatery.Menus[i].Menu.Items[j].id;
                                lst.push(dict);
                                response =lst;
                            }
                        
                        }
                    }
                
            }
        });
        return res.send(response);
    });
}
catch (err){
    res.send('Error in firebase');
}

  };

  //Add item in a type in eatery
  exports.add_item_by_type = function(req, res) {
    console.log("HTTP Item by Type Request");
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;
    var id = generateUUID();


    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var lst = [];
    var response = '';
    var flag = 1;
    var menuReference = db.ref("/Eateries");
    try{
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.id==restID)
            {

                    // console.log('Loop1');
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                        if(type === reqtype)
                        {
                        
                                // console.log('Loop2');

                                var dict = {};
                                dict['name'] = name;
                                dict['price'] = price;
                                dict['description'] = description;
                                dict['id'] = id;
                                //console.log(name);
                                if(name == "" || price == "" || description == ""){
                                    flag = 0;
                                    return res.send('Request body argument contains undefined in property or wrong request body given');
                                }
                                item.Eatery.Menus[i].Menu.Items.push(dict);
                                // console.log(lst);
                                lst = restaurant;

                                
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
                    str = "Data saved successfully and item ID is:"+id+"\n";
                    
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
}

catch (err){
    res.send('Error in firebase');
}
    
    

  };

    exports.delete_item_by_type = function(req, res) {
    console.log("HTTP Item by Type Request");

    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var itemID = req.params.itemID;
    var lst = [];
    var flag = 1;
    try{
        var menuReference = db.ref("/Eateries");
        menuReference.once("value", snap => {
            var restaurant= snap.val();
            if(restaurant==null){
                return res.send('Error in firebase');
            }
            restaurant.forEach(function(item){
                if(item.Eatery.id==restID)
                {

                        // console.log('Loop1');
                        var found = 0;
                        for (var i = 0; i < item.Eatery.Menus.length; i++) {
                            var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                            if(type === reqtype)
                            {     
                                if(item.Eatery.Menus[i].Menu.Items.length < 2){
                                    flag = 0;
                                    return res.send("Only 1 item present - Can not delete.\nPlease consider deleting menu type");
                                } 
                                for (var j = 0; j < item.Eatery.Menus[i].Menu.Items.length; j++) {
                                        var itemid = item.Eatery.Menus[i].Menu.Items[j].id;
                                        if(itemid === itemID){
                                            item.Eatery.Menus[i].Menu.Items.splice(j, 1);
                                            found = 1;
                                            //console.log('Loop Del');
                                        }
                                    }
                                    lst = restaurant;
                            }
                        }
                        if (found == 0){
                            flag=0;
                            return res.send("Item not found in database");
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
                //console.log('Stop');
                return;
            }
            
            
        });
    }
catch (err){
    res.send('Error in firebase');
}
    

  };

  exports.delete_menu_type = function(req, res) {
    console.log("HTTP Item by Type Request");

    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var lst = [];
    var flag = 1;
    try{
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.id==restID)
            {

                    // console.log('Loop1');
                    var found = 0;
                    if(item.Eatery.Menus.length < 2){
                        flag = 0;
                        return res.send("Only 1 menu type present - Can not delete.\nPlease consider updating type");
                    }
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                        if(type === reqtype)
                        {   
                                item.Eatery.Menus.splice(i, 1);
                                found = 1;
                        }
                    }
                    lst = restaurant;
                    if (found == 0){
                        flag=0;
                        return res.send("Type not found in database");
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
                    res.send("Type could not be deleted.\n" + error);
                } 
                else {
                    res.send("Type deleted successfully.\n");
                }
            });
        }
        else{
            //console.log('Stop');
            return;
        }
        
        
    });
}
catch (err){
    res.send('Error in firebase');
}
    
    

  };

//Update Menu Type
exports.update_menu_type = function(req, res) {
    console.log("HTTP Item by Type Request");

    var start = req.body.start;
    var end = req.body.end;

    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var lst = [];
    var flag = 1;

    try{
        var menuReference = db.ref("/Eateries");
        menuReference.once("value", snap => {
            var restaurant= snap.val();
            if(restaurant==null){
                return res.send('Error in firebase');
            }
            restaurant.forEach(function(item){
                if(item.Eatery.id==restID)
                {

                        // console.log('Loop1');
                        var found = 0;
                        for (var i = 0; i < item.Eatery.Menus.length; i++) {
                            var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                            if(type.indexOf(reqtype)>-1)
                            {   
                                //console.log(item.Eatery.Menus[i].Menu)
                                item.Eatery.Menus[i].Menu.StartTime =start;
                                item.Eatery.Menus[i].Menu.EndTime = end;
                                found = 1;
                            }
                        }
                        lst = restaurant;
                        if (found == 0){
                            flag=0;
                            res.send("Type not found in database");
                        }
                }
            });
            // console.log("test");
            // console.log(flag);
            if (flag == 1){
                flag = 0;
                //console.log("List present:"+lst);
                menuReference.set(lst, 
                    function(error) {
                    if (error) {
                        res.send("Type could not be updated.\n" + error);
                    } 
                    else {
                        res.send("Type updated successfully.\n");
                    }
                });
            }
            else{
                //console.log('Stop');
                return;
            }
            
            
        });
    }
    catch (err){
        res.send('Error in firebase');
    }
    
};




  exports.update_item_by_type = function(req, res) {
    console.log("HTTP Item by Type Request");
    var name = req.body.name;
    var price = req.body.price;
    var description = req.body.description;
    //console.log("body values"+name+" "+price+" "+description);

    var restID = req.params.restNameID;
    var reqtype = req.params.type.toLowerCase();
    var itemID = req.params.itemID;

    var lst = [];
    var flag = 1;
    try{
    var menuReference = db.ref("/Eateries");
    menuReference.once("value", snap => {
        var restaurant= snap.val();
        if(restaurant==null){
            return res.send('Error in firebase');
        }
        restaurant.forEach(function(item){
            if(item.Eatery.id==restID)
            {

                    // console.log('Loop1');
                    var found = 0;
                    for (var i = 0; i < item.Eatery.Menus.length; i++) {
                        var type = item.Eatery.Menus[i].Menu.Type.toLowerCase();
                        //console.log('Type:'+type);
                        if(type === reqtype)
                        {       //console.log('Loop Put1');                    
                                for (var j = 0; j < item.Eatery.Menus[i].Menu.Items.length; j++) {
                                    var itemid = item.Eatery.Menus[i].Menu.Items[j].id;
                                    // console.log(itemid);
                                    if(name == "" || price == "" || description == ""){
                                        flag = 0;
                                        return res.send('Request body argument contains undefined in property or wrong request body given');
                                    }
                                    if(itemid === itemID){
                                        item.Eatery.Menus[i].Menu.Items[j].name = name;
                                        item.Eatery.Menus[i].Menu.Items[j].price = price;
                                        item.Eatery.Menus[i].Menu.Items[j].description = description;
                                        found = 1;
                                        //console.log('Loop Put2');
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
            // console.log("List present:"+lst);
            menuReference.set(lst, 
                function(error) {
                if (error) {
                    res.send("Data could not be updated.\n" + error);
                } 
                else {
                    res.send("Data updated successfully.\n");
                }
            });
        }
        else{
            //console.log('Stop');
            return;
        }
        
        
    });
}
catch (err){
    res.send('Error in firebase');
}
    

  };
  


