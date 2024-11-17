const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Product = require('./models/product.model.js')
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Hello form node api");
});


app.get('/api/products',async (req, res) =>{
    try{
        const products = await Product.find({});
        res.status(200).json(products);
    } catch(error){
        res.status(500).json({
            message:error.message
        });
    }
});

app.post('/api/products',async (req, res) => {
    try{
        const products = await Product.create(req.body);
        res.status(200).json(product);
    }catch (error){
        res.status(500).json({message :error.message})
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