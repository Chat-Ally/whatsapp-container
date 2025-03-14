FROM oven/bun:debian

RUN apt-get update && apt-get install gnupg wget git -y && \
    wget -q -O- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /

RUN git clone https://github.com/Chat-Ally/whatsapp-container.git

WORKDIR /whatsapp-container

RUN bun install

CMD ["bun", "run",  "src/index.js"]