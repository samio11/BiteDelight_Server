# BiteDelight - Server

This is the server-side code for the BiteDelight restaurant web application. The server is built using Express.js, with MongoDB as the database, and it supports features such as JWT-based authentication, Stripe payments, and handling of cart data.

## Features

- **Authentication**: JWT (JSON Web Token) for secure authentication.
- **User Management**: Create, update, and manage users.
- **Food and Ratings**: Retrieve all available food items and their ratings.
- **Cart Management**: Add, retrieve, and delete cart items.
- **Payments**: Stripe integration for handling payments.
- **Cookie Handling**: JWT tokens stored as cookies for authentication.
- **CORS**: Configured to accept requests from the client-side link.

## Tech Stack

- **Node.js**: Backend runtime.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: Database to store user, food, rating, cart, and payment information.
- **JWT**: For user authentication.
- **Stripe**: Payment gateway for handling transactions.
- **Vercel**: Deployment platform.

## API Endpoints

### Root

- `GET /`: Returns a simple message confirming the server is running.

### User Endpoints

- `PUT /user`: Create or update a user in the database.
- `POST /jwt`: Generate a JWT token for authentication and store it in a cookie.
- `GET /remove_cookie`: Remove the JWT cookie.

### Food Endpoints

- `GET /all-food`: Retrieve all food items from the database.

### Cart Endpoints

- `POST /cart`: Add a new item to the cart.
- `GET /cartInfo/:email`: Retrieve all cart items for a specific user by email.
- `DELETE /cartData/:id`: Remove a specific item from the cart by ID.

### Rating Endpoints

- `GET /ratings`: Retrieve all food ratings from the database.

### Payment Endpoints

- `POST /create-payment-intent`: Create a payment intent for Stripe payments.
- `POST /payments`: Store payment information and clear corresponding cart items.

## Environment Variables

Make sure to create a `.env` file and add the following variables:

```plaintext
PORT=5000
DB_USER=yourMongoDBUsername
DB_PASS=yourMongoDBPassword
SECRET_KEY=yourJWTSecretKey
STRIPE_SECRET=yourStripeSecretKey
