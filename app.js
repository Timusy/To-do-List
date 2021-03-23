const express=require("express");
const https=require("https");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

// var items =["Eat Food","Listen Music","Buy Clothes"];
// var workItems=[];

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB",{ useNewUrlParser: true , useUnifiedTopology: true});

var day="";
const itemsSchema={
  name: String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name: "Shopping"
});
const item2=new Item({
  name: "Listening Music"
});
const item3=new Item({
  name: "Studying"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
  var today=new Date();

  var options={
    weekday : "long",
    day: "numeric",
    month : "long"

  };
  day=today.toLocaleDateString("en-us",options);
 Item.find({},function(err,foundItems){

   if(foundItems.length==0)
   {
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log(err);
       }
       else{
         console.log("Data entered successfully");
       }
     });
     res.redirect("/");
   }

   else{
       res.render("list",{listTitle :day, newListItems : foundItems});
   }


 });

  //  res.render("list",{listTitle : "Today", newListItems : items});

});

app.post("/",function(req,res){
  console.log(req.body);
  const itemName=req.body.newItem;
  const listName=req.body.list;
//   if(req.body.list=="Work-List"){
//     workItems.push(item);
//     res.redirect("/work");
//   }
//   else{
//   items.push(item);
//   console.log(item);
//   res.redirect("/");
// }
const item=new Item({
  name: itemName
});
if(listName==day)
{
  item.save();
  res.redirect("/");

}
else{
  List.findOne({name: listName},function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});



app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==day)
  {
     Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Data Deleted Successfully ");
        res.redirect("/");
      }
      else{
        console.log(err);
      }
    });

 }
  else{
    List.findOneAndUpdate({name:listName},{$pull :{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

// app.get("/work",function(req,res){
//   res.render("list",{listTitle : "Work-List" , newListItems : workItems});
// });
//
// app.post("/work",function(req,res){
//   var item=req.body.newItem;
//   workItems.push(item);
//   console.log(item);
//   res.redirect("/work");
// });

app.get("/:customlistName",function(req,res){
  const customlistName=_.capitalize(req.params.customlistName);
  List.findOne({name:customlistName},function(err,foundList){
    if(!err){
      if(!foundList){
        //console.log("Record doesn't exist");
        const list=new List({
          name: customlistName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customlistName);
      }
      else{
      //  console.log("Record exists");
       res.render("list",{listTitle : foundList.name, newListItems : foundList.items});
      }
    }
  });

});


app.listen(3000,function(){
  console.log("Server started at Port 3000");
});
