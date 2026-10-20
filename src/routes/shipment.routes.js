const { Router } = require('express');
const ctrl = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = Router();

router.patch('/:shipid', authenticate, authorize('admin'), ctrl.updateShipment);

module.exports = router;