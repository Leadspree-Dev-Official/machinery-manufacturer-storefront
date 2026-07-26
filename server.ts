/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { AppContent, Order, OrderStatus } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_STORE_PATH = path.join(process.cwd(), "data_store.json");

// Default initial content for premium Machinery Manufacturer
const DEFAULT_CONTENT: AppContent = {
  products: [
    {
      id: "m-101",
      name: "Apex G-300 CNC Milling Center",
      description: "Ultra-high precision 5-axis CNC machining center designed for continuous high-speed operations. Built to meet Indian BIS and ISO standards, featuring dual-drive rotary axes, real-time thermal compensation, and heavy-cast vibration absorption.",
      price: 10500000,
      category: "CNC & Milling",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60",
      specifications: {
        "Configuration": "5-Axis Articulated",
        "Spindle Speed": "12,000 RPM",
        "Axis Travel (X/Y/Z)": "800 / 600 / 550 mm",
        "Spindle Taper": "HSK-A63",
        "Drive System": "Liquid-Cooled Linear Motors",
        "Base Weight": "4,500 kg"
      },
      isTopSeller: true
    },
    {
      id: "m-102",
      name: "Titan-X Heavy Duty Hydraulic Press",
      description: "A high-capacity heavy-duty hydraulic press system featuring micro-touch feedback controls, automatic slide-guide alignment, and active hydraulic fluid cooling. Custom built for Indian automotive component manufacturers.",
      price: 7500000,
      category: "Heavy Machinery",
      imageUrl: "https://images.unsplash.com/photo-1565891741441-64926e441838?w=800&auto=format&fit=crop&q=60",
      specifications: {
        "Pressing Force": "200 Metric Tons",
        "Slide Stroke": "450 mm",
        "Daylight Opening": "800 mm",
        "Platen Dimensions": "1,200 x 1,200 mm",
        "Power Rating": "37 kW",
        "Base Weight": "6,200 kg"
      },
      isTopSeller: true
    },
    {
      id: "m-103",
      name: "Aegis Sentinel Robotic Arm",
      description: "Advanced multi-joint industrial robotic arm designed for seamless welding, automated material handling, and smart assembly. Includes integrated visual stereo-vision sensors and local RTOS v4 integration.",
      price: 3800000,
      category: "Automated Robots",
      imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=60",
      specifications: {
        "Degree of Freedom": "6 Axes",
        "Max Payload": "25 kg",
        "Horizontal Reach": "1,850 mm",
        "Repeatability": "±0.02 mm",
        "Controller Platform": "Valkyrie RTOS v4",
        "Base Weight": "240 kg"
      },
      isTopSeller: false
    },
    {
      id: "m-104",
      name: "Vanguard Precision Laser Cutter",
      description: "Industrial fiber laser cutting machine with high thermal concentration. Delivers high speed, exceptional kerf control, and mirror-smooth edges on mild steel and aluminum sheets.",
      price: 9200000,
      category: "Precision Tools",
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60",
      specifications: {
        "Fiber Laser Power": "4.0 kW",
        "Effective Travel": "3,000 x 1,500 mm",
        "Max Material (Steel)": "20 mm",
        "Max Material (Alum)": "12 mm",
        "Positioning Accuracy": "±0.03 mm/m",
        "Base Weight": "3,100 kg"
      },
      isTopSeller: false
    }
  ],
  specialists: [
    {
      id: "s-1",
      name: "Dr. Rajesh Iyer",
      role: "Chief Systems Architect",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=60",
      contact: "rajesh.iyer@apex-industrial.co.in"
    },
    {
      id: "s-2",
      name: "Priya Sharma",
      role: "Lead Robotics & Automation Engineer",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60",
      contact: "priya.sharma@apex-industrial.co.in"
    }
  ],
  config: {
    businessName: "Apex Industrial Systems India",
    tagline: "Engineering High-Performance Machinery for Atmanirbhar Bharat",
    operatingHours: "Monday - Saturday: 09:00 - 18:00 (IST)",
    email: "contact@apex-industrial.co.in",
    phone: "+91 (80) 555-APEX",
    address: "Plot 12, Phase-II, Peenya Industrial Area, Bengaluru, Karnataka 560058, India",
    accentColor: "#D97706"
  }
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "APX-2026-8941",
    visitorToken: "client-session-sample-123",
    customerInfo: {
      name: "Aarav Mehta",
      company: "Vortex Automotive India Pvt Ltd",
      email: "amehta@vortex-india.co.in",
      phone: "+91 98200 12345",
      address: "Plot 42, Sector 8, PCNTDA Industrial Area, Bhosari, Pune, Maharashtra 411026",
      gstin: "27AADCV1234A1Z5"
    },
    items: [],
    customMachine: {
      baseModelId: "m-101",
      baseModelName: "Apex G-300 CNC Milling Center",
      chassis: "Reinforced Aerospace Titanium Alloy (+1,200 kg, +₹12,50,000)",
      powerUnit: "Supercharged 30kW Spindle Drive Unit (+450 kg, +₹10,50,000)",
      controlSystem: "Smart CNC Autonomous AI Suite (+₹6,70,000)",
      addedFeatures: ["Acoustic Dampening Enclosure Block", "High-Volume Coolant Flood Jet Injectors"],
      totalWeightKg: 6150,
      totalPrice: 13950000,
      materialsBreakdown: [
        { material: "Structural Carbon Steel", percentage: 65 },
        { material: "Titanium Alloy", percentage: 20 },
        { material: "Copper & Electronics", percentage: 10 },
        { material: "High-Grade Quartz Composite", percentage: 5 }
      ]
    },
    totalPrice: 13950000,
    orderDate: "2026-07-18T14:30:00+05:30",
    status: "Preparing",
    notes: "Please calibrate the spindle for high-precision aeronautical grade titanium drilling.",
    paymentMethod: "RTGS Bank Transfer",
    deliveryMethod: "Freight Carrier (VRL Logistics)"
  }
];

interface DataStoreSchema {
  content: AppContent;
  orders: Order[];
}

// Ensure database file exists and load it
function getDatabase(): DataStoreSchema {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const rawData = fs.readFileSync(DATA_STORE_PATH, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Failed to read database, falling back to defaults", error);
  }
  
  const initialData: DataStoreSchema = {
    content: DEFAULT_CONTENT,
    orders: DEFAULT_ORDERS
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DataStoreSchema) {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to database", error);
  }
}

// Authentication Middleware helper
const ADMIN_TOKEN = "token-apex-admin-xyz";
function authenticateAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access" });
  }
}

// API Routes

// 1. GET /api/contents – Retrieve the current products, specialists, and business configurations.
app.get("/api/contents", (req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.content);
});

// 2. POST /api/contents – Overwrite the product catalog, update metadata, or save general settings (Admin authorized).
app.post("/api/contents", authenticateAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const updatedContent = req.body;
  if (!updatedContent || !updatedContent.products || !updatedContent.config || !updatedContent.specialists) {
    res.status(400).json({ error: "Invalid content schema" });
    return;
  }
  db.content = updatedContent;
  saveDatabase(db);
  res.json({ success: true, content: db.content });
});

// 3. GET /api/orders – Retrieve all customer orders logged in the database.
app.get("/api/orders", (req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.orders);
});

// 4. POST /api/orders – Append a new customer order or update an existing one.
app.post("/api/orders", (req: Request, res: Response) => {
  const db = getDatabase();
  const incomingOrder = req.body;

  if (!incomingOrder.customerInfo || !incomingOrder.customerInfo.name || !incomingOrder.customerInfo.email) {
    res.status(400).json({ error: "Missing essential customer information" });
    return;
  }

  // If order has an ID, we update it. Otherwise, we create a new one.
  if (incomingOrder.id) {
    const existingIndex = db.orders.findIndex(o => o.id === incomingOrder.id);
    if (existingIndex !== -1) {
      db.orders[existingIndex] = {
        ...db.orders[existingIndex],
        ...incomingOrder
      };
      saveDatabase(db);
      res.json({ success: true, order: db.orders[existingIndex] });
      return;
    }
  }

  // Generate a new custom high-end tracking number
  const uniqueId = `APX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    id: uniqueId,
    visitorToken: incomingOrder.visitorToken || "client-session-unknown",
    customerInfo: incomingOrder.customerInfo,
    items: incomingOrder.items || [],
    customMachine: incomingOrder.customMachine || null,
    totalPrice: incomingOrder.totalPrice || 0,
    orderDate: new Date().toISOString(),
    status: "Received",
    notes: incomingOrder.notes || "",
    paymentMethod: incomingOrder.paymentMethod || "Bank Transfer",
    deliveryMethod: incomingOrder.deliveryMethod || "Freight Carrier"
  };

  db.orders.push(newOrder);
  saveDatabase(db);
  res.status(201).json({ success: true, order: newOrder });
});

// 5. POST /api/orders/:id/status – Update the dispatch status of a specific order by ID (Admin authorized).
app.post("/api/orders/:id/status", authenticateAdmin, (req: Request, res: Response) => {
  const db = getDatabase();
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['Received', 'Preparing', 'Quality Check', 'Out for Delivery', 'Completed'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of ${validStatuses.join(", ")}` });
    return;
  }

  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  db.orders[orderIndex].status = status as OrderStatus;
  saveDatabase(db);
  res.json({ success: true, order: db.orders[orderIndex] });
});

// 6. POST /api/admin/login – Validate admin credentials and issue a session token.
app.post("/api/admin/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Setup Vite Dev server / Production Static Assets Router
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve client build index.html for non-API catch-alls
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
