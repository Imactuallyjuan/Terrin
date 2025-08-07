import { Express } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyFirebaseToken } from "../firebaseAuth";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), "uploads", "messages");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow images and documents
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and documents are allowed."));
    }
  },
});

export function registerMessageAttachmentRoutes(app: Express) {
  // Upload attachment endpoint
  app.post(
    "/api/messages/upload-attachment",
    verifyFirebaseToken,
    upload.single("attachment"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the file information
        const fileUrl = `/uploads/messages/${req.file.filename}`;
        const fileInfo = {
          url: fileUrl,
          filename: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
        };

        res.json(fileInfo);
      } catch (error: any) {
        res.status(500).json({ message: "Failed to upload attachment", error: error.message });
      }
    }
  );

  // Serve uploaded files
  app.use("/uploads/messages", (req, res, next) => {
    const uploadsPath = path.join(process.cwd(), "uploads", "messages");
    return express.static(uploadsPath)(req, res, next);
  });

  // Delete attachment endpoint
  app.delete(
    "/api/messages/attachments/:filename",
    verifyFirebaseToken,
    async (req: any, res) => {
      try {
        const { filename } = req.params;
        const filePath = path.join(process.cwd(), "uploads", "messages", filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: "File not found" });
        }

        // Delete the file
        fs.unlinkSync(filePath);
        res.json({ message: "File deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete attachment", error: error.message });
      }
    }
  );
}