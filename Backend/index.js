

const express = require('express');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const mainRoute = require('./app/routers/indexRoute');
const swaggerDocument = require('./swagger-output.json');
const dbConnect = require('./app/config/db');

// Database Connect
dbConnect();

const app = express();



// 1. UNIVERSAL CORS (Wildcard allow - sabhi origins, headers aur methods ke liye)
app.use(
  cors({
    origin: true, // Echoes the requester's origin automatically
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
  })
);





// 3. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 5. API Routes
app.use('/api/v1', mainRoute);

app.get('/', (req, res) => {
  res.send('Hospital-Managment-system');
});

// 6. Global Error Handler (Taaki backend crash ho to request hang na ho)
app.use((err, req, res, next) => {
  console.error('Unhandled Backend Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Localhost running on PORT ${PORT}`);
});