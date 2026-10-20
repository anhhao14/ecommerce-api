const productService = require('../services/product.service');

async function getAll(req, res) {
  res.json({ success: true, data: await productService.getAll() });
}

async function getById(req, res) {
  res.json({ success: true, data: await productService.getById(Number(req.params.pid)) });
}

async function create(req, res) {
  const product = await productService.create(req.body || {});
  res.status(201).json({ success: true, data: product });
}

async function update(req, res) {
  const product = await productService.update(Number(req.params.pid), req.body || {});
  res.json({ success: true, data: product });
}

async function remove(req, res) {
  await productService.remove(Number(req.params.pid));
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
}

module.exports = { getAll, getById, create, update, remove };