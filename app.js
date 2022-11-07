//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Zeeshan_Admin:Raza_786@cluster0.8fgzmay.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("list", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "welcome to do List"
});

const item2 = new Item({
    name: "code daily"
});

const item3 = new Item({
    name: "get knowledge every day"
});
const defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {
    let today = new Date();

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleDateString("en-US", options);
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("successfully  saved...");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })


});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.List;
    const item = new Item({
        name: itemName
    });
    
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
   
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkBox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("successfully deleted the item");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id: checkedItemId}}},function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });

    }
   
});


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName)
            }
            else {
                res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    });

   

});

// app.get("/work", function (req, res) {
//     res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.post("/work", function (req, res) {
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

app.listen(3000, function () {
    console.log("server started on port 3000");
});

