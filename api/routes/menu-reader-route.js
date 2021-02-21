'use strict';
module.exports = function(app) {
  var todoList = require('./menu-reader');

app.route('/getEateryID/:restName')
.get(todoList.get_eatery_id); 

app.route('/Eatery/:restNameID')
.get(todoList.get_menu_type); 

app.route('/Eatery/:restNameID')
.post(todoList.add_menu_type); 

app.route('/Eatery/:restNameID/:type')
.put(todoList.update_menu_type); 

app.route('/Eatery/:restNameID/:type')
.delete(todoList.delete_menu_type); 

app.route('/Eatery/:restNameID/:type')
.get(todoList.get_item_by_type); 

app.route('/Eatery/:restNameID/:type')
.post(todoList.add_item_by_type); 

app.route('/Eatery/:restNameID/:type/:itemID')
.delete(todoList.delete_item_by_type); 

app.route('/Eatery/:restNameID/:type/:itemID')
.put(todoList.update_item_by_type);

};
