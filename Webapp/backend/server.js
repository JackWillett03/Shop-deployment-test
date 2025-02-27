const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const ShopListroute = require('./route/ShopListroute');
const StockListroute = require('./route/StockListroute');
const Salesroute = require('./route/Salesroute');
const Usersroute = require('./route/Usersroute');
const Staffroute = require('./route/Staffroute');
const app = express();
const server = http.createServer(app);


dotenv.config(); // Load environment variables

// MongoDB connection
const mongoURL = process.env.CONNECTION; // Connection string
mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

app.use(cors())

// Route handlers
app.use('/shops', ShopListroute);
app.use('/stocks', StockListroute);
app.use('/sales', Salesroute);
app.use('/users', Usersroute);
app.use('/staff', Staffroute);

// Check API is running
app.get('/', (req, res) => {
  res.json({ message: 'API is running successfully' });
});

// Catch-all route for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for testing purposes
module.exports = app;
