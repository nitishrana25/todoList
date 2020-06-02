//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemSchema=new mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",itemSchema);
const item1= new Item({
  name:"welcome todo list!"
});
const item2=new Item({
  name:"coding"
});
const item3=new Item({
  name:"sleeping"
});
const defaultItem=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {

Item.find({},function(err,foundItem){
  if(foundItem.length===0){
    Item.insertMany(defaultItem,function(err){
      if(err){
        console.log("err");
      }else{
        console.log("suceessfully added")
      }
    });
  res.redirect("/");
}else{
  res.render("list", {listTitle: "Today", newListItems:foundItem});
}
});
});

app.get("/:customNameList",function(req,res){
  const customNameList=_.capitalize(req.params.customNameList);
  List.findOne({name:customNameList},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customNameList,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customNameList)
      }else{
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){
const itemName=req.body.newItem;
const listName=req.body.list;

const item=new Item({
  name: itemName
});
if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log("err");
      }else{
        console.log("sucessfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate(
      {name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
