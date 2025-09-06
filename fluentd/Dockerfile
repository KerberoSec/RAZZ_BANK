FROM fluent/fluentd:v1.16-debian-1

# Use root account to install dependencies
USER root

# Install additional plugins
RUN buildDeps="sudo make gcc g++ libc-dev" \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps \
    && gem install fluent-plugin-elasticsearch \
    && gem install fluent-plugin-record-reformer \
    && SUDO_FORCE_REMOVE=yes \
    apt-get purge -y --auto-remove \
    -o APT::AutoRemove::RecommendsImportant=false \
    $buildDeps \
    && rm -rf /var/lib/apt/lists/* \
    && gem sources --clear-all \
    && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem

# Switch back to fluent user
USER fluent