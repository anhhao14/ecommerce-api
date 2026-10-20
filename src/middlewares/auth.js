const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

// Bắt buộc header: Authorization: Bearer <token>
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Chưa đăng nhập: thiếu token (Authorization: Bearer <token>)');
  }

  try {
    // payload: { uid, username, role }
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    throw new AppError(401, 'Token không hợp lệ hoặc đã hết hạn');
  }
}

// Chỉ cho các role được liệt kê, ví dụ authorize('admin')
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
}

module.exports = { authenticate, authorize };