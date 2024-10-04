const express = require('express');
const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo/userdb', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const User = mongoose.model('User', userSchema);

// Create a new user
app.post('/users', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();

    // Publish message to RabbitMQ
    amqp.connect('amqp://rabbitmq', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            const queue = 'user_created';
            const msg = JSON.stringify(newUser);

            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(`[User Service] Sent to queue: ${msg}`);
        });
    });

    res.status(201).send(newUser);
});

app.listen(4000, () => {
    console.log('User Service listening on port 4000');
});
