//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-laxman:test123admin@sample.jj2m4ux.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser : true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item',itemSchema);

const item1 = new Item({
  name:"Eat healthy"
});

const item2 = new Item({
  name:"Work Out!!"
});

const item3 = new Item({
  name:"Sleep Early"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name : String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,result){
    if(result.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
          else{
            console.log("Inserted Successfully");
          }
        });
        res.redirect("/");
    }else{res.render("list", {listTitle: "Today", newListItems: result});}

  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,result){
      if(!err){
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);
      }
    })
  }
});

app.post("/delete",function(req,res){
  Item.findByIdAndRemove(req.body.checkBox,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("removed Successfully");
      res.redirect("/")
    }
  })
})


app.get("/about", function(req, res){
  res.render("about");
});

app.get('/:listName',function(req,res){
  const listname = req.params.listName;

  List.findOne({name:listname},function(err,results){
    if(!err){
      if(!results){
        //create a new list
        const list = new List({
          name : listname,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listname)
      }
      else{
        //show list
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  })


})
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully ");
});
