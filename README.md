## NimbusImageChatbot

# Clone in the directory:
git clone https://github.com/arjunrajlaboratory/NimbusImageChatbot.git

# To install the back end:
```
# Install docker on AWS Linux 2:
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```
Do a restart.

Then:
```
docker build -t flask-chatbot-server .
docker run -p 5000:5000 -e ANTHROPIC_API_KEY=your_api_key_here flask-chatbot-server
```

# To install the front end:
Install node etc.
```
sudo yum update -y
sudo yum install -y nodejs npm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
```

Then:
```
npm install
npm run dev
```
