const orderService = require('../services/order.service');

async function create(req, res) {
  const order = await orderService.createOrder(req.user.uid, (req.body || {}).items);
  res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: order });
}

async function getAll(req, res) {
  res.json({ success: true, data: await orderService.getMyOrders(req.user) });
}

async function getById(req, res) {
  res.json({ success: true, data: await orderService.getOrderById(req.user, Number(req.params.oid)) });
}

async function getShipments(req, res) {
  res.json({ success: true, data: await orderService.getShipments(req.user, Number(req.params.oid)) });
}

async function updateShipment(req, res) {
  const shipment = await orderService.updateShipmentStatus(
    Number(req.params.shipid),
    (req.body || {}).status,
  );
  res.json({ success: true, data: shipment });
}

module.exports = { create, getAll, getById, getShipments, updateShipment };