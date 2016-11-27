FROM node:6.9.0

ADD . /opt/srv

WORKDIR /opt/srv

RUN rm -rf node_modules

RUN npm install --production

EXPOSE 5000

CMD ["node", "app"]
