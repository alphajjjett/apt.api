const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Product = require('./models/product.model.js');
const productRoute = require('./routes/product.route.js');

app.use(express.json());

app.use(express.urlencoded({extended: false}));



// middleware
app.use("/api/products", productRoute);



app.get('/', (req, res) => {
    res.send("Hello form node api");
});



//ลบข้อมูล

app.delete('/api/products/:id', async (req, res)=>{
    try{
        const {id} = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({message : "Product not found!"})
        }

        res.status(200).json({message : "Product deleted successfully"})

    }catch(error){

        res.status(500).json({message : error.message});
    }
});






mongoose.connect("mongodb+srv://suttipat2453:jet10220@nodeapi.njaen.mongodb.net/Node-API?retryWrites=true&w=majority&appName=NodeAPI")
.then(() => {
    console.log("connect to database !");
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
})

.catch(() =>{
    console.log("Connection Failed!");
})