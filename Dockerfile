From ubuntu

MAINTAINER  orion nelson <me@or9.ca>



RUN apt-get update && apt-get install -y \
python3 \
python3-pip \
redis-server \
npm \
curl \
postgresql \
postgresql-contrib


RUN curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh && bash nodesource_setup.sh
RUN apt-get install -y nodejs \

