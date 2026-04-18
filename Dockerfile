FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages
COPY artifacts/ ./artifacts/
COPY lib/ ./lib/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API server
RUN pnpm --filter @workspace/api-server run build

# Expose port
EXPOSE 3000

# Start the API server
CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
