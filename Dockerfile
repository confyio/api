FROM mhart/alpine-node:6

RUN apk add --no-cache git make gcc g++ python

ADD . /opt/srv
WORKDIR /opt/srv

RUN npm install --production

EXPOSE 5000

CMD ["node", "app"]
