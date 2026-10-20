const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const orderInclude = {
  orderDetails: { include: { product: { select: { pid: true, pname: true } } } },
  shipments: true,
};

// total: sơ đồ không có cột tổng tiền -> tính từ qty x unit_price
// createat_vn: DB lưu giờ UTC, hiển thị thêm giờ Việt Nam
function formatOrder(order) {
  const total = order.orderDetails.reduce(
    (sum, d) => sum + Number(d.unit_price) * d.qty,
    0,
  );
  const createat_vn = order.createat.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  return { ...order, createat_vn, total };
}

// Gộp sản phẩm trùng: [{pid:1,qty:1},{pid:1,qty:2}] -> [{pid:1,qty:3}]
function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'items phải là mảng, ví dụ [{ "pid": 1, "qty": 2 }]');
  }
  const map = new Map();
  for (const item of items) {
    const pid = Number(item.pid);
    const qty = Number(item.qty);
    if (!Number.isInteger(pid) || !Number.isInteger(qty) || qty <= 0) {
      throw new AppError(400, 'Mỗi item cần pid và qty là số nguyên dương');
    }
    map.set(pid, (map.get(pid) || 0) + qty);
  }
  return [...map].map(([pid, qty]) => ({ pid, qty }));
}

async function createOrder(uid, items) {
  const list = normalizeItems(items);

  // Transaction: tất cả thành công, hoặc hủy toàn bộ
  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { pid: { in: list.map((i) => i.pid) } },
    });

    // 1. Kiểm tra sản phẩm và trừ kho (chỉ trừ khi quantity >= qty)
    for (const item of list) {
      const product = products.find((p) => p.pid === item.pid);
      if (!product) throw new AppError(404, `Không tìm thấy sản phẩm pid=${item.pid}`);

      const result = await tx.product.updateMany({
        where: { pid: item.pid, quantity: { gte: item.qty } },
        data: { quantity: { decrement: item.qty } },
      });
      if (result.count === 0) {
        throw new AppError(400, `Sản phẩm "${product.pname}" không đủ hàng (còn ${product.quantity})`);
      }
    }

    // 2. Tạo Order (createat = giờ hiện hành, server tự lấy) + OrderDetail (giá lấy từ DB)
    const created = await tx.order.create({
      data: {
        uid,
        orderDetails: {
          create: list.map((item) => ({
            pid: item.pid,
            qty: item.qty,
            unit_price: products.find((p) => p.pid === item.pid).price,
          })),
        },
      },
    });

    // 3. Đặt hàng thành công -> chuyển sang Shipment
    await tx.shipment.create({ data: { oid: created.oid, status: 'pending' } });

    return tx.order.findUnique({ where: { oid: created.oid }, include: orderInclude });
  });

  return formatOrder(order);
}

// Admin xem mọi đơn, user thường chỉ xem đơn của mình
function ownerFilter(user) {
  return user.role === 'admin' ? {} : { uid: user.uid };
}

async function getMyOrders(user) {
  const orders = await prisma.order.findMany({
    where: ownerFilter(user),
    include: orderInclude,
    orderBy: { oid: 'desc' },
  });
  return orders.map(formatOrder);
}

async function getOrderById(user, oid) {
  const order = await prisma.order.findFirst({
    where: { oid, ...ownerFilter(user) },
    include: orderInclude,
  });
  if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
  return formatOrder(order);
}

async function getShipments(user, oid) {
  const order = await getOrderById(user, oid);
  return order.shipments;
}

async function updateShipmentStatus(shipid, status) {
  const allowed = ['pending', 'shipping', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    throw new AppError(400, `status phải là một trong: ${allowed.join(', ')}`);
  }
  const shipment = await prisma.shipment.findUnique({ where: { shipid } });
  if (!shipment) throw new AppError(404, 'Không tìm thấy shipment');
  return prisma.shipment.update({ where: { shipid }, data: { status } });
}

module.exports = { createOrder, getMyOrders, getOrderById, getShipments, updateShipmentStatus };