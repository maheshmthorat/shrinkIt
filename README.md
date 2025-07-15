## 📦 ShrinkIt — Image Compressor

**ShrinkIt** is a simple, modern image compression tool built with **Next.js (App Router)**.
It allows users to upload images, compress them on the fly using `sharp`, and view/download the results — all in the browser.

✨ Explore the live demo, add tasks, toggle priorities, and manage your day—all in your browser.

[![Open Playground](https://img.shields.io/badge/Try%20Now-Playground-blueviolet?style=for-the-badge&logo=vercel&logoColor=white)](https://shrink--it.vercel.app/)

### 🚀 Features

* ✅ Built with **Next.js App Router**
* 📷 Upload multiple images (PNG, JPG, JPEG, GIF, SVG)
* 🧠 Session-based image handling (via UUID)
* ⚡ Image compression using **Sharp**
* 📄 Base64 previews for both original & compressed images
* 🌀 Smooth UI with image loaders and drag-drop support
* ❌ No cloud storage required (everything in `/tmp`)
* 📦 Can be extended with ZIP/download logic or S3 support

### 🛠️ Tech Stack

* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Image Compression**: [`sharp`](https://www.npmjs.com/package/sharp)
* **UUIDs**: [`uuid`](https://www.npmjs.com/package/uuid)

### 📷 How it works

1. User uploads image(s)
2. Each session gets a unique ID (`uuid`)
3. Images are stored in `/tmp` (runtime memory)
4. `sharp` compresses the image (e.g., 60% JPEG quality)
5. Frontend shows original and compressed image previews using base64

### 🧪 Local Development

```bash
git clone https://github.com/maheshmthorat/shrinkit.git
cd shrinkit
npm install
npm run dev
```

Access the app at `http://localhost:3000`.


### ⚠️ Deployment Note

> **Vercel note**: Since Vercel doesn't allow writing to disk outside `/tmp`, all compressed data is stored in memory and previewed via base64. Download support is limited unless cloud storage (like S3) is added.


### 📝 Future Improvements

* 🔒 Password/session protected image views
* ☁️ Optional image uploads to **S3 / Cloudinary / Firebase**
* 🗜️ Add zip download feature for all compressed images
* 📊 Image compression stats & comparison graphs


### 📄 License

MIT — feel free to use, improve, and share!