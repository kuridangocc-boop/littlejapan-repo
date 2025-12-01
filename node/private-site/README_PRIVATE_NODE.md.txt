# **README_PRIVATE_NODE.md**

```markdown
# LittleJapan Private Website (Node.js)

This is the **private Node.js website** for LittleJapan members.  
It allows members to **view Japanese teaching materials (PowerPoint slides converted to HTML)** in a **view-only environment**.  
Slides cannot be downloaded — members can only view them through the website.

---

## **Folder Structure**

```

private-site/
├─ package.json                  # Node.js package file
├─ server.js                     # Main Express server
├─ .env.example                  # Example environment variables
├─ lib/
│   ├─ auth.js                   # JWT authentication and middleware
│   └─ convert.js                # PPTX to HTML conversion logic
├─ routes/
│   ├─ auth.js                   # Member login / JWT token routes
│   ├─ admin.js                  # Admin upload routes (protected with basic auth)
│   └─ viewer.js                 # Slide viewing routes (JWT protected)
├─ public/
│   ├─ dashboard.html            # Member dashboard
│   ├─ viewer.html               # Slide viewer page
│   ├─ css/
│   │   └─ style.css             # Styling for dashboard and viewer
│   └─ js/
│       ├─ dashboard.js          # Dashboard interactivity
│       └─ viewer.js             # Viewer interactivity
└─ uploads/                       # Optional local storage (or EFS mount)
└─ converted/                     # Converted HTML slides (or EFS mount)

````

---

## **Setup**

1. **Install dependencies**:

```bash
cd private-site
npm install
````

2. **Environment Variables**

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

* `PORT`: Port to run the server (default `4000`)
* `ADMIN_USER` / `ADMIN_PASS`: Credentials for `/admin/upload` route
* `JWT_SECRET`: Secret key for member JWT tokens
* `UPLOAD_DIR`: Directory to store uploaded PPTX files (e.g., EFS path)
* `CONVERTED_DIR`: Directory for converted HTML slides (e.g., EFS path)
* `DB_FILE`: SQLite database file (optional)

---

3. **Run the server**:

```bash
node server.js
# or development mode:
npm run dev
```

By default, server runs on:

```
http://localhost:4000
```

---

## **Features**

### **1. Admin Upload**

* Route: `/admin/upload`
* Protected via **Basic Auth** (`ADMIN_USER` / `ADMIN_PASS`)
* Upload PowerPoint slides (`.pptx`)
* Converts PPTX to HTML and saves to `CONVERTED_DIR`
* Example curl:

```bash
curl -u admin:yourpassword -F "pptx=@greetings.pptx" http://localhost:4000/admin/upload
```

---

### **2. Member Authentication**

* Route: `/auth/login`

* Accepts `email` and `password` (validate against DB)

* Returns **JWT token** for authenticated requests

* Example JSON request:

```json
{
  "email": "member@example.com",
  "password": "password123"
}
```

* Response:

```json
{
  "token": "<JWT_TOKEN>"
}
```

---

### **3. Member Dashboard**

* URL: `/dashboard`
* Displays list of available slides
* Clicking a slide opens the **viewer iframe** in `viewer.html`
* **No downloads allowed**

---

### **4. Slide Viewer**

* URL: `/viewer/:slideId`
* Serves converted HTML of a slide inside an iframe
* Only accessible with valid JWT token

---

### **5. PPTX to HTML Conversion**

* Implemented in `lib/convert.js`
* Converts uploaded PPTX slides to HTML for web viewing
* Converts and saves in folder: `${CONVERTED_DIR}/<slide_id>/index.html`

---

## **JavaScript Frontend**

* **dashboard.js**: Loads available slides and opens viewer iframe
* **viewer.js**: Loads specific slide in iframe based on query parameter
* **style.css**: Shared styling for dashboard and viewer

---

## **EFS or Local Storage**

* `UPLOAD_DIR` → Stores uploaded `.pptx` files
* `CONVERTED_DIR` → Stores converted HTML slides
* Recommended: **EFS mount** for multi-AZ scalability on AWS

---

## **Security Notes**

* **JWT** secures member routes (`/dashboard`, `/viewer/:slideId`)
* **Basic Auth** secures admin upload routes
* Slides **cannot be downloaded** by members

---

## **Dependencies**

* Node.js >= 16
* express
* express-basic-auth
* multer
* jsonwebtoken
* bcrypt
* sqlite3 (optional)
* dotenv

Install with:

```bash
npm install
```

---

## **Author**

LittleJapan Team

```

---
