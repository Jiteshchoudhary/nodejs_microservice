const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo/productdb', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Product schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
});

const Product = mongoose.model('Product', productSchema);

// Create a new product
app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).send(newProduct);
});

app.listen(5000, () => {
    console.log('Product Service listening on port 5000');
});
