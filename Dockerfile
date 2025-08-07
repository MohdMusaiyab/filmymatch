# Use official Node image with Alpine for smaller size
FROM node:20-alpine

# Install system packages for native Prisma engine compatibility
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy dependencies first for better layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose app port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Automatically sync schema to DB and start dev server
CMD npx prisma db push && npm run dev
