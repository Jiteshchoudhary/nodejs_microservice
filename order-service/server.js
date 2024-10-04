const express = require('express');
const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB connection with error handling
mongoose.connect('mongodb://mongo/orderdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Define Order schema
const orderSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    quantity: Number,
});

const Order = mongoose.model('Order', orderSchema);

// Create a new order
app.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).send(newOrder);
    } catch (err) {
        res.status(500).send({ error: 'Failed to create order', message: err.message });
    }
});

// RabbitMQ Consumer to listen for new user creation events with retry logic
function connectRabbitMQ() {
    amqp.connect('amqp://rabbitmq', function (error0, connection) {
        if (error0) {
            console.error('Failed to connect to RabbitMQ, retrying in 5 seconds...', error0);
            return setTimeout(connectRabbitMQ, 5000);  // Retry connection after 5 seconds
        }

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log('jitesh')
                console.error('Failed to create RabbitMQ channel', error1);
                return;
            }

            const queue = 'user_created';

            channel.assertQueue(queue, { durable: false });
            console.log(`[*] Waiting for messages in ${queue}`);

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    const user = JSON.parse(msg.content.toString());
                    console.log(`[Order Service] Received user data:`, user);
                }
            }, { noAck: true });
        });

        // Ensure we handle connection close/reconnect
        connection.on('close', () => {
            console.error('RabbitMQ connection closed, reconnecting...');
            setTimeout(connectRabbitMQ, 5000);
        });

        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err);
            setTimeout(connectRabbitMQ, 5000);  // Retry after failure
        });
    });
}

// Start RabbitMQ connection
connectRabbitMQ();

// Start the Express server
const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Order Service listening on port ${PORT}`);
});
