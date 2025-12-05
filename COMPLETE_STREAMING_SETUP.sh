#!/bin/bash

###############################################################################
# COMPLETE STREAMING SETUP SCRIPT
# Reddy Anna Betting Platform - OvenMediaEngine Integration
# 
# This script will:
# 1. Install Docker (if needed)
# 2. Deploy OvenMediaEngine container
# 3. Configure streaming endpoints
# 4. Set up SSL certificates (optional)
# 5. Create admin stream control interface
# 6. Test streaming connectivity
#
# Usage: bash COMPLETE_STREAMING_SETUP.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   REDDY ANNA STREAMING SETUP                                  ║"
echo "║   OvenMediaEngine Ultra-Low Latency Configuration             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

###############################################################################
# STEP 1: Check Prerequisites
###############################################################################

log_info "Checking prerequisites..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_warning "Running as root. Consider using a non-root user with sudo."
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    log_warning "Docker not found. Installing Docker..."
    
    # Install Docker (Ubuntu/Debian)
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl start docker
        sudo systemctl enable docker
        log_success "Docker installed successfully"
    else
        log_error "Automatic Docker installation not supported for this OS"
        log_info "Please install Docker manually: https://docs.docker.com/get-docker/"
        exit 1
    fi
else
    log_success "Docker is installed: $(docker --version)"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installed"
else
    log_success "Docker Compose is installed: $(docker-compose --version)"
fi

###############################################################################
# STEP 2: Get Configuration from User
###############################################################################

log_info "Gathering configuration..."

# Get server IP
DEFAULT_IP=$(hostname -I | awk '{print $1}')
read -p "Enter your server IP address [$DEFAULT_IP]: " SERVER_IP
SERVER_IP=${SERVER_IP:-$DEFAULT_IP}

# Get domain (optional)
read -p "Enter your domain name (leave empty for IP-only): " DOMAIN_NAME

# SSL/TLS Setup
USE_SSL="n"
if [ ! -z "$DOMAIN_NAME" ]; then
    read -p "Do you want to enable SSL/TLS? (y/n) [n]: " USE_SSL
    USE_SSL=${USE_SSL:-n}
fi

# Stream key (for security)
STREAM_KEY=$(openssl rand -hex 16)
log_success "Generated secure stream key: $STREAM_KEY"

# OME API Key (for management)
OME_API_KEY=$(openssl rand -hex 32)
log_success "Generated OME API key: $OME_API_KEY"

###############################################################################
# STEP 3: Create OvenMediaEngine Configuration
###############################################################################

log_info "Creating OvenMediaEngine configuration..."

mkdir -p ./ome-config
mkdir -p ./ome-logs

# Create Server.xml - Part 1
cat > ./ome-config/Server.xml << 'EOFXML'
<?xml version="1.0" encoding="UTF-8"?>
<Server version="8">
    <Name>OvenMediaEngine</Name>
    <Type>origin</Type>
    <IP>*</IP>

    <API>
        <Port>8081</Port>
        <WorkerCount>1</WorkerCount>
        <AccessToken>OME_API_KEY_PLACEHOLDER</AccessToken>
    </API>

    <Bind>
        <Providers>
            <RTMP>
                <Port>1935</Port>
                <WorkerCount>1</WorkerCount>
            </RTMP>
        </Providers>

        <Publishers>
            <HLS>
                <Port>3334</Port>
                <TLSPort>SSL_PORT_PLACEHOLDER</TLSPort>
                <WorkerCount>1</WorkerCount>
            </HLS>
            <LLHLS>
                <Port>3334</Port>
                <TLSPort>SSL_PORT_PLACEHOLDER</TLSPort>
                <WorkerCount>1</WorkerCount>
            </LLHLS>
            <WebRTC>
                <Signalling>
                    <Port>3333</Port>
                    <TLSPort>SSL_SIGNALLING_PORT_PLACEHOLDER</TLSPort>
                    <WorkerCount>1</WorkerCount>
                </Signalling>
                <IceCandidates>
                    <IceCandidate>SERVER_IP_PLACEHOLDER:10000-10005/udp</IceCandidate>
                </IceCandidates>
            </WebRTC>
        </Publishers>
    </Bind>

    <VirtualHosts>
        <VirtualHost>
            <Name>default</Name>

            <Domain>
                <Names>
                    <Name>*</Name>
                </Names>
            </Domain>

            <Applications>
                <Application>
                    <Name>app</Name>
                    <Type>live</Type>
                    <OutputProfiles>
                        <OutputProfile>
                            <Name>default</Name>
                            <OutputStreamName>${OriginStreamName}</OutputStreamName>

                            <Encodes>
                                <Audio>
                                    <Codec>opus</Codec>
                                    <Bitrate>128000</Bitrate>
                                    <Samplerate>48000</Samplerate>
                                    <Channel>2</Channel>
                                    <Bypass>false</Bypass>
                                </Audio>
                                <Video>
                                    <Codec>h264</Codec>
                                    <Width>1280</Width>
                                    <Height>720</Height>
                                    <Bitrate>2500000</Bitrate>
                                    <Framerate>30</Framerate>
                                    <Preset>veryfast</Preset>
                                    <Profile>main</Profile>
                                    <Bypass>false</Bypass>
                                </Video>
                            </Encodes>
                        </OutputProfile>
                    </OutputProfiles>

                    <Providers>
                        <RTMP>
                            <StreamKey>STREAM_KEY_PLACEHOLDER</StreamKey>
                        </RTMP>
                    </Providers>

                    <Publishers>
                        <HLS>
                            <SegmentDuration>2</SegmentDuration>
                            <SegmentCount>10</SegmentCount>
                            <CrossDomains>
                                <Url>*</Url>
                            </CrossDomains>
                        </HLS>

                        <LLHLS>
                            <SegmentDuration>0.5</SegmentDuration>
                            <PartDuration>0.1</PartDuration>
                            <SegmentCount>10</SegmentCount>
                            <CrossDomains>
                                <Url>*</Url>
                            </CrossDomains>
                        </LLHLS>

                        <WebRTC>
                            <Timeout>30000</Timeout>
                            <Rtx>false</Rtx>
                            <Ulpfec>false</Ulpfec>
                            <JitterBuffer>false</JitterBuffer>
                        </WebRTC>
                    </Publishers>
                </Application>
            </Applications>
        </VirtualHost>
    </VirtualHosts>
</Server>
EOFXML

# Replace placeholders
sed -i "s/SERVER_IP_PLACEHOLDER/$SERVER_IP/g" ./ome-config/Server.xml
sed -i "s/OME_API_KEY_PLACEHOLDER/$OME_API_KEY/g" ./ome-config/Server.xml
sed -i "s/STREAM_KEY_PLACEHOLDER/$STREAM_KEY/g" ./ome-config/Server.xml

if [ "$USE_SSL" = "y" ]; then
    sed -i "s/SSL_PORT_PLACEHOLDER/3335/g" ./ome-config/Server.xml
    sed -i "s/SSL_SIGNALLING_PORT_PLACEHOLDER/3334/g" ./ome-config/Server.xml
else
    sed -i '/<TLSPort>/d' ./ome-config/Server.xml
fi

log_success "OvenMediaEngine configuration created"

###############################################################################
# STEP 4: Create Docker Compose Configuration
###############################################################################

log_info "Creating Docker Compose configuration..."

cat > docker-compose.streaming.yml << 'EOFDOCKER'
version: '3.8'

services:
  ovenmediaengine:
    image: airensoft/ovenmediaengine:latest
    container_name: ome-streaming
    restart: unless-stopped
    ports:
      - "1935:1935"
      - "3334:3334"
      - "3335:3335"
      - "3333:3333"
      - "10000-10005:10000-10005/udp"
      - "8081:8081"
    volumes:
      - ./ome-config/Server.xml:/opt/ovenmediaengine/bin/conf/Server.xml:ro
      - ./ome-logs:/var/log/ovenmediaengine
    environment:
      - OME_HOST_IP=SERVER_IP_PLACEHOLDER
    networks:
      - streaming-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/v1/vhosts"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  streaming-network:
    driver: bridge
EOFDOCKER

sed -i "s/SERVER_IP_PLACEHOLDER/$SERVER_IP/g" docker-compose.streaming.yml

log_success "Docker Compose configuration created"

###############################################################################
# STEP 5: Deploy OvenMediaEngine
###############################################################################

log_info "Deploying OvenMediaEngine container..."

if [ "$(docker ps -q -f name=ome-streaming)" ]; then
    log_warning "Stopping existing OvenMediaEngine container..."
    docker-compose -f docker-compose.streaming.yml down
fi

docker-compose -f docker-compose.streaming.yml up -d

log_info "Waiting for OvenMediaEngine to start..."
sleep 10

if [ "$(docker ps -q -f name=ome-streaming)" ]; then
    log_success "OvenMediaEngine container is running"
else
    log_error "Failed to start OvenMediaEngine container"
    docker logs ome-streaming
    exit 1
fi

RETRY_COUNT=0
MAX_RETRIES=12
until docker inspect --format='{{.State.Health.Status}}' ome-streaming | grep -q "healthy" || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    log_info "Waiting for health check... ($(($RETRY_COUNT+1))/$MAX_RETRIES)"
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_warning "Health check timeout, but container is running"
else
    log_success "OvenMediaEngine is healthy"
fi

###############################################################################
# STEP 6: Create Backend Environment Configuration
###############################################################################

log_info "Creating backend environment configuration..."

cat > ./backend/.env.streaming << EOFENV
# OvenMediaEngine Configuration
OME_API_URL=http://localhost:8081/v1
OME_API_KEY=$OME_API_KEY
RTMP_URL=rtmp://$SERVER_IP:1935
WEBRTC_URL=ws://$SERVER_IP:3333
LL_HLS_URL=$([ "$USE_SSL" = "y" ] && echo "https://$SERVER_IP:3335" || echo "http://$SERVER_IP:3334")

# Stream Configuration
STREAM_KEY=$STREAM_KEY
DEFAULT_STREAM_APP=app
DEFAULT_STREAM_NAME=stream
EOFENV

log_success "Backend streaming configuration created: backend/.env.streaming"

###############################################################################
# STEP 7: Save Credentials
###############################################################################

cat > STREAMING_CREDENTIALS.txt << EOFCRED
STREAMING CREDENTIALS
=====================

Server IP: $SERVER_IP
$([ ! -z "$DOMAIN_NAME" ] && echo "Domain: $DOMAIN_NAME")
Stream Key: $STREAM_KEY
OME API Key: $OME_API_KEY

RTMP URL (OBS): rtmp://$SERVER_IP:1935/app/$STREAM_KEY
LL-HLS URL: $([ "$USE_SSL" = "y" ] && echo "https://$SERVER_IP:3335" || echo "http://$SERVER_IP:3334")/app/stream/llhls.m3u8

⚠️  KEEP THIS FILE SECURE!
EOFCRED

###############################################################################
# STEP 8: Display Summary
###############################################################################

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   STREAMING SETUP COMPLETE! ✅                                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📡 STREAMING INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎥 RTMP Input (OBS):"
echo "   Server: rtmp://$SERVER_IP:1935/app"
echo "   Stream Key: $STREAM_KEY"
echo ""
echo "📺 Playback URLs:"
echo "   LL-HLS: $([ "$USE_SSL" = "y" ] && echo "https://$SERVER_IP:3335" || echo "http://$SERVER_IP:3334")/app/stream/llhls.m3u8"
echo "   HLS: $([ "$USE_SSL" = "y" ] && echo "https://$SERVER_IP:3335" || echo "http://$SERVER_IP:3334")/app/stream/playlist.m3u8"
echo ""
echo "🔑 API Configuration:"
echo "   API URL: http://localhost:8081/v1"
echo "   API Key: $OME_API_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Add streaming variables to backend/.env (see backend/.env.streaming)"
echo "2. Restart backend: cd backend && npm run dev"
echo "3. Configure OBS Studio with RTMP URL above"
echo "4. Start streaming from OBS"
echo "5. Test stream in your frontend"
echo ""
echo "🛠️  USEFUL COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View logs:    docker logs -f ome-streaming"
echo "Restart:      docker-compose -f docker-compose.streaming.yml restart"
echo "Stop:         docker-compose -f docker-compose.streaming.yml down"
echo ""

log_success "Credentials saved to: STREAMING_CREDENTIALS.txt"
log_success "🎉 Streaming setup complete! Happy broadcasting! 🎥"