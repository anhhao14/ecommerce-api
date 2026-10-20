FROM node:22-alpine

# Prisma cần openssl trên alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package*.json trước để tận dụng cache khi build lại
COPY package*.json ./
RUN npm ci

# Copy schema rồi sinh Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy mã nguồn
COPY src ./src

EXPOSE 3000

# Khởi động: áp migration -> seed -> chạy server
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]