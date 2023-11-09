FROM ponycool/alpine-3.16:latest

WORKDIR /autMan

RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2 \
	&& ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2 \
	&& apk add --no-cache libaio libnsl libc6-compat \
	&& mkdir /app \
	&& cd /app \
	&& apk update \
	&& apk add curl \
	&& apk add jq \
	&& apk add wget \
	&& apk add tar \
	&& apk add python3 \
	&& apk add py3-pip \
	&& apk add nodejs \
	&& apk add npm \
	&& apk add php php-cli php-fpm php-mysqli php-json php-openssl \
	&& apk add icu-data-full

add . /app/autMan/
COPY ./docker-entrypoint.sh /bin/

RUN chmod a+x /bin/docker-entrypoint.sh \
	&& apk add git \
  	&& apk add bash \
	&& apk add ffmpeg

ENTRYPOINT ["/bin/docker-entrypoint.sh"]