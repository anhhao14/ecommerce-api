const { Router } = require('express');
const ctrl = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:pid', ctrl.getById);

router.post('/', authenticate, authorize('admin'), ctrl.create);
router.put('/:pid', authenticate, authorize('admin'), ctrl.update);
router.delete('/:pid', authenticate, authorize('admin'), ctrl.remove);

module.exports = router;