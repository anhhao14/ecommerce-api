const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

function validate({ pname, price, quantity }) {
  if (!pname) throw new AppError(400, 'Cần nhập pname');
  if (price === undefined || Number(price) < 0) throw new AppError(400, 'price phải >= 0');
  if (quantity === undefined || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    throw new AppError(400, 'quantity phải là số nguyên >= 0');
  }
}

async function getAll() {
  return prisma.product.findMany({ orderBy: { pid: 'asc' } });
}

async function getById(pid) {
  const product = await prisma.product.findUnique({ where: { pid } });
  if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');
  return product;
}

async function create(data) {
  validate(data);
  return prisma.product.create({
    data: { pname: data.pname, price: data.price, quantity: Number(data.quantity) },
  });
}

async function update(pid, data) {
  await getById(pid);
  validate(data);
  return prisma.product.update({
    where: { pid },
    data: { pname: data.pname, price: data.price, quantity: Number(data.quantity) },
  });
}

async function remove(pid) {
  await getById(pid);
  const used = await prisma.orderDetail.count({ where: { pid } });
  if (used > 0) throw new AppError(409, 'Sản phẩm đã có trong đơn hàng, không thể xóa');
  await prisma.product.delete({ where: { pid } });
}

module.exports = { getAll, getById, create, update, remove };