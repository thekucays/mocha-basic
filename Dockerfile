# Use Jenkins LTS as base image
FROM jenkins/jenkins:lts

# Switch to root user for installations
USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    xvfb \
    x11vnc \
    fluxbox \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install Firefox
RUN apt-get update && apt-get install -y firefox-esr \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install ChromeDriver (latest version)
RUN wget -O /tmp/chromedriver.zip https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/139.0.7258.127/linux64/chromedriver-linux64.zip \
    && unzip /tmp/chromedriver.zip -d /tmp/ \
    && mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/ \
    && rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64 \
    && chmod +x /usr/local/bin/chromedriver

# Install GeckoDriver
RUN GECKODRIVER_VERSION=$(curl -s https://api.github.com/repos/mozilla/geckodriver/releases/latest | grep -o '"tag_name": "v[^"]*"' | cut -d'"' -f4) \
    && wget -O /tmp/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/$GECKODRIVER_VERSION/geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz \
    && tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin/ \
    && rm /tmp/geckodriver.tar.gz \
    && chmod +x /usr/local/bin/geckodriver

# Set display environment variable
ENV DISPLAY=:99

# Create startup script for Xvfb with proper Jenkins startup
RUN echo '#!/bin/bash\n\
# Clean up any existing X11 lock files\n\
rm -f /tmp/.X99-lock\n\
rm -f /tmp/.X11-unix/X99\n\
\n\
# Start Xvfb\n\
Xvfb :99 -screen 0 1024x768x24 &\n\
sleep 2\n\
\n\
# Start fluxbox\n\
fluxbox &\n\
sleep 2\n\
\n\
# Start VNC server\n\
x11vnc -display :99 -nopw -listen localhost -xkb -ncache 10 -ncache_cr -forever &\n\
\n\
# Start Jenkins\n\
exec /usr/local/bin/jenkins.sh' > /usr/local/bin/startup.sh \
    && chmod +x /usr/local/bin/startup.sh

# Switch back to jenkins user
USER jenkins

# Set working directory
WORKDIR /var/jenkins_home

# Expose ports
EXPOSE 8080 50000 5900

# Use custom startup script
ENTRYPOINT ["/usr/local/bin/startup.sh"] 