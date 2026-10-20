const authService = require('../services/auth.service');

async function register(req, res) {
  const user = await authService.register(req.body || {});
  res.status(201).json({ success: true, message: 'Đăng ký thành công', data: user });
}

async function login(req, res) {
  const result = await authService.login(req.body || {});
  res.json({ success: true, message: 'Đăng nhập thành công', data: result });
}

async function me(req, res) {
  const user = await authService.getProfile(req.user.uid);
  res.json({ success: true, data: user });
}

module.exports = { register, login, me };