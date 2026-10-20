const { Router } = require('express');
const prisma = require('../config/prisma');

const router = Router();

router.get('/', async (req, res) => {
  const result = {
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: 'up',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json(result);
  } catch (err) {
    result.status = 'error';
    result.database = 'down';
    res.status(503).json(result);
  }
});

module.exports = router;