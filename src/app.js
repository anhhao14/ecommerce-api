const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');  
const productRoutes = require('./routes/product.routes'); 
const orderRoutes = require('./routes/order.routes'); 
const shipmentRoutes = require('./routes/shipment.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);  
app.use('/api/orders', orderRoutes); 
app.use('/api/shipments', shipmentRoutes); 

app.use(notFound);
app.use(errorHandler);

module.exports = app;