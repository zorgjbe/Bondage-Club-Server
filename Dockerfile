FROM node:14

WORKDIR /app
ADD package*.json /app/
RUN npm ci
ADD . /app/
# ENV DEBUG=*
# ENV NODE_OPTIONS='--inspect=0.0.0.0:9229 --inspect-brk'
CMD [ "npm", "run", "start:debug"]
