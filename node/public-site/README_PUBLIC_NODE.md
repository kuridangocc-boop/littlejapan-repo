# **README_PUBLIC_NODE.md**

```markdown
# LittleJapan Public Website (Node.js)

This is the **public-facing Node.js website** for LittleJapan.  
It provides general information about membership access and available Japanese teaching materials.  

---

## **Folder Structure**

```

public-site/
├─ package.json          # Node.js package file
├─ server.js             # Express server for public site
├─ public/
│   ├─ index.html        # Homepage
│   ├─ membership.html   # Membership information page
│   ├─ css/
│   │   └─ style.css     # General styling
│   └─ js/
│       └─ main.js       # Frontend JS for navigation and buttons

````

---

## **Setup**

1. **Install dependencies**:

```bash
cd public-site
npm install
````

2. **Run the server**:

```bash
node server.js
```

3. By default, the server runs on **port 3000**. Open in your browser:

```
http://localhost:3000
```

---

## **Environment Variables**

This public site does **not require sensitive environment variables**.
For optional configurations (like custom PORT), you can set environment variables:

```bash
export PORT=3000
```

---

## **Usage**

* **Homepage (`index.html`)**: General information about LittleJapan and membership.
* **Membership page (`membership.html`)**: Information on how to access the private members-only site.
* **CSS (`public/css/style.css`)**: Styling for all public pages.
* **JS (`public/js/main.js`)**: Handles navigation, alerts, and buttons (login/subscription placeholders).

---

## **Notes**

* This site is **fully public**; no authentication is required.
* For member-only content (PowerPoint teaching materials), refer to the **private Node.js site**.

---

## **Dependencies**

* Node.js >= 16
* Express

Install with:

```bash
npm install express
```

Optional development:

```bash
npm install --save-dev nodemon
```

---

## **Author**

LittleJapan Team

```

---

