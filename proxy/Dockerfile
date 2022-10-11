FROM nginx:stable

# Clear out existing configuration
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html -rf

VOLUME /var/log/nginx
VOLUME /run/proxy

COPY proxy/nginx.conf.template /etc/nginx/nginx.conf.template
COPY proxy/bin /usr/local/bin

COPY app/client/dist /usr/share/nginx/html

ENTRYPOINT ["/usr/local/bin/reverse-proxy"]
