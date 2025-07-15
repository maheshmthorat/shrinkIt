const express = require("express");
const multer = require("multer");
const compress_images = require("compress-images");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

function createMulterForSession(sessionId) {
  const inputDir = path.join("tmp", sessionId, "input");
  fs.mkdirSync(inputDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, inputDir);
    },
    filename: function (req, file, cb) {
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
    {
      gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
    },
    function (err, completed) {

      if (completed === true) {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
          const inputFiles = fs.readdirSync(inputPath);
          const outputFiles = fs.readdirSync(outputPath);

          const resultList = inputFiles.map((file) => {
            const original = path.join(inputPath, file);
            const compressed = path.join(outputPath, file);
            const originalSize = fs.existsSync(original) ? fs.statSync(original).size : 0;
            const compressedSize = fs.existsSync(compressed) ? fs.statSync(compressed).size : 0;

            return {
              originalUrl: "/" + original.replace(/\\/g, "/"),
              compressedUrl: "/" + compressed.replace(/\\/g, "/"),
              originalSize,
              compressedSize,
              filename: file
            };
          });

          app.use("/tmp", express.static("tmp"));

          res.json({
            images: resultList,
          });

        });

        archive.on("error", err => {
          res.status(500).send("Error zipping files");
        });

        archive.pipe(output);
        archive.directory(outputPath + "/", false);
        archive.finalize();
      } else {
        res.status(500).send("Compression failed");
      }
    }
  );
}

app.post("/upload", (req, res) => {
  const sessionId = uuidv4();
  const upload = createMulterForSession(sessionId);

  upload.array("images")(req, res, function (err) {
    if (err) {
      return res.status(500).send("Upload failed");
    }

    console.log("Session:", sessionId);
    compressCallback(sessionId, res);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
