# Step 1: Build Stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Production Stage
FROM nginx:stable-alpine
# Vite builds to 'dist' folder by default
COPY --from=build-stage /app/dist /usr/share/nginx/html
# We'll create this nginx.conf in the next step
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]