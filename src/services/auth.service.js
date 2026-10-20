const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret, jwtExpiresIn, bcryptSaltRounds } = require('../config/env');
const AppError = require('../utils/AppError');

const DEFAULT_ROLE = 'normal';
const DEFAULT_MEMBERSHIP = 'Member'; // score = 10 (tạo trong seed)

// Không bao giờ trả password ra ngoài
function toPublicUser(user) {
  return {
    uid: user.uid,
    username: user.username,
    fullname: user.fullname,
    role: user.role.rolename,
    membership: { mid: user.membership.mid, mname: user.membership.mname, score: user.membership.score },
  };
}

async function register({ username, fullname, password }) {
  if (!username || !fullname || !password) {
    throw new AppError(400, 'Cần nhập đủ username, fullname, password');
  }
  if (password.length < 6) {
    throw new AppError(400, 'Mật khẩu tối thiểu 6 ký tự');
  }

  const existed = await prisma.user.findUnique({ where: { username } });
  if (existed) throw new AppError(409, 'Username đã tồn tại');

  const role = await prisma.role.findUnique({ where: { rolename: DEFAULT_ROLE } });
  const membership = await prisma.memberShip.findUnique({ where: { mname: DEFAULT_MEMBERSHIP } });
  if (!role || !membership) {
    throw new AppError(500, 'Chưa seed role/membership mặc định');
  }

  const hashed = await bcrypt.hash(password, bcryptSaltRounds);

  const user = await prisma.user.create({
    data: { username, fullname, password: hashed, roleid: role.roleid, mid: membership.mid },
    include: { role: true, membership: true },
  });

  return toPublicUser(user);
}

async function login({ username, password }) {
  if (!username || !password) {
    throw new AppError(400, 'Cần nhập username và password');
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true, membership: true },
  });

  // Báo chung một câu để không lộ username có tồn tại hay không
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError(401, 'Sai username hoặc password');

  const token = jwt.sign(
    { uid: user.uid, username: user.username, role: user.role.rolename },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

  return { token, user: toPublicUser(user) };
}

async function getProfile(uid) {
  const user = await prisma.user.findUnique({
    where: { uid },
    include: { role: true, membership: true },
  });
  if (!user) throw new AppError(404, 'Không tìm thấy user');
  return toPublicUser(user);
}

module.exports = { register, login, getProfile };