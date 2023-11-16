FROM node

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm i --legacy-peer-deps

RUN npx prisma generate

EXPOSE 6000
CMD [ "npm", "start" ]