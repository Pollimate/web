# Use official Node.js image
FROM node:24.2.0-slim

# Set production environment
ENV NODE_ENV=production

WORKDIR /app


# Copy whole monorepo structure relative to root
COPY . .

RUN yarn install --frozen-lockfile --production=false

RUN yarn build


WORKDIR /app/apps/backend

EXPOSE 3500
CMD ["yarn", "start"]

