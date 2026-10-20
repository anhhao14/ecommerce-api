const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(404, `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Body JSON không hợp lệ' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Dữ liệu đã tồn tại' });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Lỗi hệ thống' : err.message,
  });
}

module.exports = { notFound, errorHandler };