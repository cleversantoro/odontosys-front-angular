# ===== Build =====
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== Runtime =====
FROM nginx:1.27-alpine AS runtime
RUN rm -rf /usr/share/nginx/html/*

# 👇 copia o conteúdo da pasta browser
COPY --from=build /app/dist/odontosys-angular/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
