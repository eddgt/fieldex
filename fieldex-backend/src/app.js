require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middlewares/errorHandler.middleware');
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/clients.routes');
const visitRoutes = require('./routes/visits.routes');
const photoRoutes = require('./routes/photos.routes');
const reportRoutes = require('./routes/reports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const userRoutes = require('./routes/users.routes');
const notificationRoutes = require('./routes/notifications.routes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, cb) {
      // Permite requests sin origin (mobile apps, curl, Postman)
      if (!origin) return cb(null, true);
      // En desarrollo permite tunnels de VS Code
      if (process.env.NODE_ENV !== 'production' && (
        origin.endsWith('.app.github.dev') ||
        origin.endsWith('.devtunnels.ms')
      )) {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/visits', photoRoutes);
app.use('/api/v1/visits', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Fieldex API corriendo en puerto ${PORT}`));

module.exports = app;
