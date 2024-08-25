## NimbusImageChatbot

# Clone in the directory:
```
git clone https://github.com/arjunrajlaboratory/NimbusImageChatbot.git
```

# To install the back end (Ubuntu/AWS):
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo docker run hello-world
```
Do a restart.

You also probably need to do
```
sudo usermod -aG docker ${USER}
```
Then log out and back in again. Blah.

Then:
```
docker build -t flask-chatbot-server .
docker run -p 5000:5000 -e ANTHROPIC_API_KEY=your_api_key_here flask-chatbot-server
```

# To install the front end:
Install node etc.
```
sudo apt update
sudo apt install nodejs npm -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
```

Then:
```
npm install
npm run dev
```
