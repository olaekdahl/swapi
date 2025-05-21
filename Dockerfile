FROM node:23.11.1-alpine3.21
WORKDIR /app
COPY ./server package*.json ./
RUN npm install
COPY ./server .
EXPOSE 3000 80 443
CMD ["npm", "start"]