FROM mhart/alpine-node:6

RUN apk add --no-cache git make gcc g++ python

ADD . /opt/srv
WORKDIR /opt/srv

RUN rm -rf node_modules
RUN npm install --production

EXPOSE 5000

CMD ["node", "app"]
