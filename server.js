const express = require("express");
const multer = require("multer");
const compress_images = require("compress-images");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5000;

const allowedOrigins = ["http://localhost:3000", "http://192.168.2.27:3000", "https://shrink--it.vercel.app/"];

// ✅ CORS with credentials
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use("/tmp", express.static("tmp"));
app.use(express.static("public"));

function createMulterForSession(sessionId) {
  const inputDir = path.join("tmp", sessionId, "input");
  fs.mkdirSync(inputDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, inputDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    }
  });

  return multer({ storage });
}

function compressCallback(sessionId, res) {
  const inputPath = path.join("tmp", sessionId, "input");
  const outputPath = path.join("tmp", sessionId, "output");
  const zipPath = path.join("tmp", sessionId, "compressed.zip");

  fs.mkdirSync(outputPath, { recursive: true });

  compress_images(
    inputPath.replace(/\\/g, "/") + "/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}",
    outputPath + "/",
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
    function (err, completed) {
      if (!completed) return res.status(500).send("Compression failed");

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        const inputFiles = fs.readdirSync(inputPath);
        const resultList = inputFiles.map((file) => {
          const original = path.join(inputPath, file);
          const compressed = path.join(outputPath, file);
          return {
            filename: file,
            originalUrl: "/" + original.replace(/\\/g, "/"),
            compressedUrl: "/" + compressed.replace(/\\/g, "/"),
            originalSize: fs.existsSync(original) ? fs.statSync(original).size : 0,
            compressedSize: fs.existsSync(compressed) ? fs.statSync(compressed).size : 0,
          };
        });

        res.json({
          images: resultList,
          zipUrl: `/tmp/${sessionId}/compressed.zip`
        });
      });

      archive.on("error", err => {
        res.status(500).send("Error zipping files");
      });

      archive.pipe(output);
      archive.directory(outputPath + "/", false);
      archive.finalize();
    }
  );
}

// ✅ Upload endpoint with session-based cookie
app.post("/upload", (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session cookie" });
  }

  const upload = createMulterForSession(sessionId);

  upload.array("images")(req, res, function (err) {
    if (err) return res.status(500).send("Upload failed");

    console.log("Session:", sessionId);
    compressCallback(sessionId, res);
  });
});

app.get("/session/images", (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "No session cookie found" });
  }

  const inputPath = path.join("tmp", sessionId, "input");
  const outputPath = path.join("tmp", sessionId, "output");
  const zipPath = path.join("tmp", sessionId, "compressed.zip");

  if (!fs.existsSync(outputPath)) {
    return res.status(404).json({ error: "No compressed images for this session" });
  }

  const files = fs.readdirSync(outputPath).map(file => {
    const compressedFile = path.join(outputPath, file);
    const originalFile = path.join(inputPath, file);

    const compressedSize = fs.existsSync(compressedFile)
      ? fs.statSync(compressedFile).size
      : 0;

    const originalSize = fs.existsSync(originalFile)
      ? fs.statSync(originalFile).size
      : 0;

    return {
      filename: file,
      originalUrl: `/tmp/${sessionId}/input/${file}`,
      compressedUrl: `/tmp/${sessionId}/output/${file}`,
      originalSize,
      compressedSize
    };
  });

  res.json({
    images: files,
    zipUrl: fs.existsSync(zipPath) ? `/tmp/${sessionId}/compressed.zip` : null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
