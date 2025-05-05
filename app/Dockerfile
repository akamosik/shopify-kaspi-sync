FROM node:20-slim

WORKDIR /app

RUN apt-get update && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./package*.json . 
RUN npm install

EXPOSE 3000

CMD ["bash"]