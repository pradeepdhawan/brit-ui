FROM node:alpine

WORKDIR /app
COPY . .

RUN npm install

# Expose the port.
EXPOSE 3000

CMD ["npm", "start"]
