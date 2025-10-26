# Little Japan — Japanese Teaching Tools Website

This repository hosts a Node.js + Express application for selling Japanese teaching materials (PowerPoint slides).  
Payments are processed via PayPal; files are securely hosted in AWS S3.

---

## 🖥 Deploy on AWS EC2

1. **Launch EC2**
   - Region: us-east-1
   - OS: Amazon Linux 2 or Ubuntu 22
   - Security Group: open 22, 80, 443
   - Attach an IAM role with S3 Put/Get permissions.

2. **Install dependencies**
   ```bash
   sudo apt update && sudo apt install -y git nodejs npm
   git clone https://github.com/yourusernamekuridangocc-boop/littlejapan-repo.git
   cd littlejapan
   npm install
   cp .env.example .env
   nano .env   # fill AWS, S3, PayPal, admin password

3. Create an S3 bucket
aws s3 mb s3://your-s3-bucket --region us-east-1

4. Run the app
npm start

Visit https://<EC2-public-IP>:3000.
5. (Optional) Configure Nginx reverse proxy + SSL with Certbot for littlejapan.com.

🧾 Upload PowerPoint Teaching Tools

Go to http://<your-ec2-ip>:3000/admin.html

Enter your admin password (set in .env).

Upload PPTX and fill metadata.

It will upload to your S3 bucket and appear in /api/products.

💵 PayPal Setup

Log in to PayPal Developer Dashboard
.

Create an App (Live and Sandbox) → copy Client ID and Secret into .env.

Replace YOUR_PAYPAL_CLIENT_ID in public/product.html with your ID.

🗾 Customization

Update public/index.html hero text & images to emphasize Japan & customs.

Add pages (About, Contact, FAQ) in public/.

Edit CSS in public/styles.css to match your brand.

🛡 Security Notes

Keep .env secrets private.

Do not expose your S3 bucket publicly.

Always run behind HTTPS.

For production, validate PayPal webhooks before granting downloads.