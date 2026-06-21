# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (leverage layer caching).
# Use `npm install` since the repo has no committed package-lock.json.
COPY package*.json ./
RUN npm install

# Build the static site.
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
