const { port, nodeEnv } = require('./config/env');
const app = require('./app');
const prisma = require('./config/prisma');

const server = app.listen(port, () => {
  console.log(`🚀 Server chạy tại http://localhost:${port} (${nodeEnv})`);
});

// docker compose down gửi SIGTERM -> đóng server và kết nối DB gọn gàng
async function shutdown(signal) {
  console.log(`${signal} nhận được, đang tắt server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));