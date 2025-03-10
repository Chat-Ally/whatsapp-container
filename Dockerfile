# Use the official Ubuntu base image
FROM ubuntu:latest

# Set non-interactive mode for apt-get
ARG DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg && 

# Download and install nvm:
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# in lieu of restarting the shell
RUN \. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
RUN nvm install 23

# Verify the Node.js version:
RUN node -v # Should print "v23.9.0".
RUN nvm current # Should print "v23.9.0".

# Verify npm version:
RUN npm -v # Should print "10.9.2".

# Set the working directory inside the container
WORKDIR /app

# Copy your JavaScript file into the container. Assume your file is named app.js
COPY dist/ .

# Run the application
CMD ["node", "index.js"]
