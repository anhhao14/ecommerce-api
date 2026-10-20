const { Router } = require('express');
const ctrl = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.use(authenticate);

router.post('/', ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:oid', ctrl.getById);
router.get('/:oid/shipments', ctrl.getShipments);

module.exports = router;