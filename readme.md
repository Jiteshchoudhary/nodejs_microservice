## to setup the project just clone this repository

# this project implement rabbit mq and microservice examples communicate with help of the queue.

# run this command to run that project 
docker-compose up --build

#use this curl to check the endpoints whenever the user create will automatically received data into order microservice through queue

curl -X POST http://localhost:4000/users \
-H "Content-Type: application/json" \
-d '{"name": "John Doe", "email": "johndoe@example.com"}'


curl -X POST http://localhost:5000/products \
-H "Content-Type: application/json" \
-d '{"name": "Laptop", "price": 1200}'


curl -X POST http://localhost:6000/orders \
-H "Content-Type: application/json" \
-d '{"userId": "user-id", "productId": "product-id", "quantity": 2}'
