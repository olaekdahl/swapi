FROM node:alpine
WORKDIR /app
COPY ./server package*.json ./
RUN npm install
COPY ./server .
EXPOSE 3000 80 443
CMD ["npm", "start"]