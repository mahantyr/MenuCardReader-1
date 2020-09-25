'use strict';
module.exports = function(app) {
  var todoList = require('./menu-reader');

app.route('/Eatery/:restName')
.get(todoList.get_menu_type);

app.route('/Eatery/:restName/:type')
.get(todoList.get_item_by_type);

app.route('/Eatery/:restName/:type')
.post(todoList.add_item_by_type);

};