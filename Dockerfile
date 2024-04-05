FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install -y gnupg wget curl

RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

RUN apt-get update

RUN apt-get install -y mongodb-org

RUN echo "mongodb-org hold" | dpkg --set-selections \
    && echo "mongodb-org-database hold" | dpkg --set-selections \
    && echo "mongodb-org-server hold" | dpkg --set-selections \
    && echo "mongodb-mongosh hold" | dpkg --set-selections \
    && echo "mongodb-org-mongos hold" | dpkg --set-selections \
    && echo "mongodb-org-tools hold" | dpkg --set-selections

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean

RUN pip3 install --upgrade pip

WORKDIR /app/

COPY . /app/

RUN pip install -r /app/requirements.txt

EXPOSE 8000 27017

RUN mkdir -p /data/db
RUN chown -R mongodb:mongodb /data/db

CMD mongod & mongoimport --host localhost --port 27017 --db server_logs --collection state_logs --file data.json --jsonArray & uvicorn main:app --host 0.0.0.0 --port 8000

