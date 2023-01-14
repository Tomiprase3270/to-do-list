require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const date = require("./setDay");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();


// untuk menggunakan body-parser 
app.use(bodyParser.urlencoded({ extended: true }))
// untuk mengarahkan express js ke static file di css
app.use(express.static("public"));

app.set("view engine", "ejs");

const URL = process.env.MONGODB_URI

mongoose.connect(URL, { useNewUrlParser: true });

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);


const training = new Item({
    name: "Training"
});

const reading = new Item({
    name: "Reading a book"
})

const defaultItems = [training, reading]


const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("list", listSchema);

// day variable
let day = date.getDate();

app.get("/", (req, res) => {

    Item.find({}, (err, foundItems) => {

        if (!err) {
            res.render("index", { listTitle: day, newListItem: foundItems });
        }



        // if (foundItems.length === 0) {
        //     Item.insertMany(defaultItems, (err) => {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             console.log("success save default item to databases");
        //         }
        //     });
        //     res.redirect("/");
        // } else {
        //     res.render("index", { listTitle: day, newListItem: foundItems });
        // }


    });
});


// custom list Express.js Route parameter
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName
                })
                list.save()
                res.redirect("/" + customListName)

            } else {
                res.render("index", { listTitle: customListName, newListItem: foundList.items });
            }

        }

    })

})


// create new item data
app.post("/", (req, res) => {

    const item = req.body.newItem;
    const listTitle = req.body.list;
    // let today = date.getDate();

    const newdata = new Item({
        name: item
    });

    if (listTitle == day) {
        newdata.save()
        res.redirect("/")
    } else {
        List.findOne({ name: listTitle }, (err, foundList) => {
            if (!err) {
                foundList.items.push(newdata);
                foundList.save();
                res.redirect("/" + listTitle);
            }
        })
    }
});


// delete item data 
app.post("/delete", (req, res) => {
    const checkItemId = req.body.checkboxItem;
    const listName = req.body.listName;


    if (listName == day) {
        Item.findByIdAndRemove(checkItemId, (err) => {
            if (!err) {
                console.log(`successfully deleted id = "${checkItemId}" from database`);
                res.redirect("/")
            }
        })
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

})


// membuat halaman about denagn layout ejs
app.get("/about", (req, res) => {
    res.render("about");
})



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("server running succesfully");
})

