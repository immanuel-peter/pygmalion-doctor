# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY . .

# Expose and default command (overridden in compose for dev)
EXPOSE 3000
CMD ["pnpm", "start"]
