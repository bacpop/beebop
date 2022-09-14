FROM nginx:stable

# Clear out existing configuration
RUN rm /etc/nginx/conf.d/default.conf

VOLUME /var/log/nginx
VOLUME /run/proxy

COPY nginx.conf /etc/nginx/nginx.conf
COPY bin /usr/local/bin

ENTRYPOINT ["/usr/local/bin/reverse-proxy"]
