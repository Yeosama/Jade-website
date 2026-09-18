const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { GoogleGenAI } = require("@google/genai");
const multer = require("multer");
const db = require("./db");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FormData = require("form-data");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const PLATFORM_FEE_RATE = parseFloat(process.env.PLATFORM_FEE_RATE || "0.05"); // 默认5%

// 火山引擎配置
const VOLCANO_AK = process.env.VOLCANO_AK;
const VOLCANO_SK = process.env.VOLCANO_SK;
const VOLCANO_HOST = "visual.volcengineapi.com";
const VOLCANO_REGION = "cn-north-1";
const VOLCANO_SERVICE = "cv";

// 千问视觉理解配置
const QWEN_API_KEY = process.env.DASHSCOPE_API_KEY;
const QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const QWEN_MODEL = "qwen3.5-plus"; // 也可用 qwen3-vl-plus

// 初始化 Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "your-api-key",
});

// 增加请求体大小限制
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.245.1:3000",
  // 如果需要其他地址可继续添加
];
app.use(cors({ origin: true, credentials: true }));

// 配置文件存储（保留扩展名）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname)); // 关键：添加扩展名
  },
});

const updateUpload = multer({ storage: storage }); // 编辑时也使用相同配置
const upload = multer({ storage: storage });

// 静态文件服务（供前端访问上传的图片）
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 通用函数：调用千问视觉理解 API
async function callQwenVision(imageUrls, textPrompt) {
  // 构建 content 数组：图片 + 文本
  const content = [];
  for (const url of imageUrls) {
    content.push({
      type: "image_url",
      image_url: { url },
    });
  }
  content.push({ type: "text", text: textPrompt });

  const payload = {
    model: QWEN_MODEL,
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
  };

  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/chat/completions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000, // 改为 120000 毫秒
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("千问API调用失败:", error.response?.data || error.message);
    throw new Error("AI分析服务暂时不可用");
  }
}

// 玉石鉴定（两张图片：自然光 + 透光）
app.post("/api/analyze", async (req, res) => {
  try {
    const { normalImage, lightImage } = req.body;
    if (!normalImage || !lightImage) {
      return res.status(400).json({ error: "请同时上传自然光照片和透光照片" });
    }

    // 将 base64 转换为 data URL
    const normalUrl = `data:image/jpeg;base64,${normalImage}`;
    const lightUrl = `data:image/jpeg;base64,${lightImage}`;

    // 专业 Prompt（保持原有风格）
    const prompt = `
你是一位精通中国玉器的鉴定大师，尤其熟悉"四会玉器"的特点。
我将提供两张同一块玉石的照片：
1. 第一张是【自然光/普通光线】下的照片，用于看整体颜色、器型和工艺。
2. 第二张是【透光/手电打光】下的照片，这是鉴定玉石内部结构、种水、裂纹和杂质的关键。

请结合这两张照片，输出一份专业的鉴赏报告。请务必包含以下五个维度的详细分析，并使用 Markdown 格式输出：

## 1. 种水分析 (Species & Water)
判断其种质（如玻璃种、冰种、糯种、豆种等）和水头（透明度）。

## 2. 颜色品鉴 (Color)
描述颜色的色调、饱和度、分布情况（如飘花、满色、阳绿等）。

## 3. 内部结构与瑕疵 (Structure & Flaws)
**重点结合透光照分析**。观察是否有裂纹、棉絮、黑点或其他杂质。

## 4. 四会工艺 (Sihui Craftsmanship)
四会工以"精、奇、巧"著称，常通过"俏色"或"避裂雕刻"化腐朽为神奇。请评价其雕刻题材、线条流畅度，以及是否体现了四会工的特点（如摆件、挂件的独特处理）。

## 5. 综合评价 (Overall valuation)
给出一个总结性的评价，适合收藏还是佩戴。

语气请保持专业、客观且富有文化底蕴。
`;

    const result = await callQwenVision([normalUrl, lightUrl], prompt);
    res.json({ result });
  } catch (error) {
    console.error("鉴定失败:", error);
    res.status(500).json({ error: error.message || "服务器内部错误" });
  }
});

// 聊天接口（需认证或不需要，根据需求）
// 聊天路由（使用千问视觉模型）
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "消息不能为空" });
  }

  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!DASHSCOPE_API_KEY) {
    console.error("未配置 DASHSCOPE_API_KEY 环境变量");
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  try {
    const response = await axios({
      method: "POST",
      url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "qwen3.5-flash", // 使用千问模型
        messages: [
          {
            role: "system",
            content:
              "你是一位博学的四会玉器专家，语气亲切，精通玉石知识、市场行情和四会历史。请用简练的中文回答。",
          },
          {
            role: "user",
            content: message,
          },
        ],
        stream: false,
      },
      timeout: 30000,
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("千问API调用失败:", error.response?.data || error.message);
    res.status(500).json({ error: "AI 服务暂时不可用" });
  }
});

// ---------- 认证中间件（替换原同步版本）----------
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // 从数据库获取用户完整信息，包括付费状态
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id, username, avatar, has_paid_analysis, role FROM users WHERE id = ?",
        [decoded.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    if (!user) {
      return res.status(401).json({ error: "用户不存在或已被删除" });
    }
    req.user = user; // 包含 id, username, avatar, has_paid_analysis
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "无效或过期的令牌" });
    }
    next(err);
  }
};

// 商户角色验证中间件
const requireMerchant = async (req, res, next) => {
  if (req.user.role !== "merchant") {
    return res.status(403).json({ error: "需要商户权限" });
  }
  // 检查商户状态是否有效
  db.get(
    "SELECT * FROM merchants WHERE user_id = ? AND status = 'active' AND expire_date > datetime('now')",
    [req.user.id],
    (err, merchant) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!merchant)
        return res.status(403).json({ error: "商户入驻已过期或未开通" });
      req.merchant = merchant;
      next();
    }
  );
};

// 可选认证中间件：解析 token 但不强制要求
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }
    // 从数据库获取完整用户信息
    try {
      const user = await new Promise((resolve, reject) => {
        db.get(
          "SELECT id, username, avatar, has_paid_analysis FROM users WHERE id = ?",
          [decoded.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      req.user = user || null;
    } catch (e) {
      req.user = null;
    }
    next();
  });
};

// 申请入驻 (模拟支付年费)
app.post("/api/merchant/apply", authenticateToken, (req, res) => {
  const { shop_name, description, contact } = req.body;
  if (!shop_name) return res.status(400).json({ error: "店铺名称不能为空" });

  // 检查是否已有有效商户
  db.get(
    "SELECT * FROM merchants WHERE user_id = ?",
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (
        row &&
        row.status === "active" &&
        row.expire_date > new Date().toISOString()
      ) {
        return res.status(400).json({ error: "您已经是商户" });
      }

      // 模拟支付（实际应接入支付回调），这里直接激活
      const expireDate = new Date(
        Date.now() + 365 * 24 * 3600 * 1000
      ).toISOString();
      if (row) {
        // 续费更新
        db.run(
          "UPDATE merchants SET shop_name = ?, description = ?, contact = ?, expire_date = ?, status = 'active' WHERE user_id = ?",
          [
            shop_name,
            description || "",
            contact || "",
            expireDate,
            req.user.id,
          ],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            // 更新用户角色为 merchant
            db.run("UPDATE users SET role = 'merchant' WHERE id = ?", [req.user.id], function (err) {
              if (err) return res.status(500).json({ error: err.message });
              // 重新查询用户最新信息（包含 role）
              db.get("SELECT id, username, role, avatar FROM users WHERE id = ?", [req.user.id], (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                // 生成新 token
                const newToken = jwt.sign(
                  { id: user.id, username: user.username, role: user.role },
                  JWT_SECRET,
                  { expiresIn: "7d" }
                );
                res.json({ message: '入驻成功', expire_date: expireDate, token: newToken, user });
              });
            });
          }
        );
      } else {
        // 新入驻
        db.run(
          "INSERT INTO merchants (user_id, shop_name, description, contact, expire_date) VALUES (?, ?, ?, ?, ?)",
          [
            req.user.id,
            shop_name,
            description || "",
            contact || "",
            expireDate,
          ],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run("UPDATE users SET role = 'merchant' WHERE id = ?", [
              req.user.id,
            ]);
            res
              .status(201)
              .json({ message: "入驻成功", expire_date: expireDate });
          }
        );
      }
    }
  );
});

// 获取商品列表（首页展示、分类筛选）
app.get("/api/products", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category;

  let where = "WHERE p.status = 'active'";
  let params = [];
  if (category) {
    where += " AND p.category = ?";
    params.push(category);
  }

  db.all(
    `SELECT p.*, m.shop_name, (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
     FROM products p JOIN merchants m ON p.merchant_id = m.id
     ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
    (err, products) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(products);
    }
  );
});

// 商品详情
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  db.get(
    `SELECT p.*, m.shop_name, m.contact
     FROM products p JOIN merchants m ON p.merchant_id = m.id
     WHERE p.id = ? AND p.status = 'active'`,
    [productId],
    (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product)
        return res.status(404).json({ error: "商品不存在或已下架" });

      // 获取所有图片
      db.all(
        "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order",
        [productId],
        (err, images) => {
          if (err) return res.status(500).json({ error: err.message });
          product.images = images.map((img) => img.image_url);
          res.json(product);
        }
      );
    }
  );
});

// 加入购物车
app.post("/api/cart", authenticateToken, (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity)
    return res.status(400).json({ error: "参数不完整" });

  // 验证商品有效
  db.get(
    "SELECT id, stock, status FROM products WHERE id = ?",
    [product_id],
    (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product || product.status !== "active")
        return res.status(400).json({ error: "商品无效" });

      db.run(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + ?",
        [req.user.id, product_id, quantity, quantity],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "已加入购物车" });
        }
      );
    }
  );
});

// 获取购物车（带商品详情）
app.get("/api/cart", authenticateToken, (req, res) => {
  db.all(
    `SELECT c.id as cart_item_id, c.quantity, p.*, m.shop_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     JOIN merchants m ON p.merchant_id = m.id
     WHERE c.user_id = ? AND p.status = 'active'`,
    [req.user.id],
    (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(items);
    }
  );
});

// 更新购物车数量
app.put("/api/cart/:id", authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const cartId = req.params.id;
  db.run(
    "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
    [quantity, cartId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "购物车项不存在" });
      res.json({ message: "已更新" });
    }
  );
});

// 删除购物车项
app.delete("/api/cart/:id", authenticateToken, (req, res) => {
  const cartId = req.params.id;
  db.run(
    "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
    [cartId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "已删除" });
    }
  );
});

app.post("/api/orders", authenticateToken, (req, res) => {
  const { address } = req.body;

  // 获取当前用户购物车商品（带商户信息）
  db.all(
    `SELECT c.quantity, p.*, p.merchant_id, m.id as merchant_pk
     FROM cart_items c
     JOIN products p ON c.product_id = p.id
     JOIN merchants m ON p.merchant_id = m.id
     WHERE c.user_id = ? AND p.status = 'active' AND p.stock > 0`,
    [req.user.id],
    (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      if (items.length === 0)
        return res.status(400).json({ error: "购物车为空或商品已失效" });

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const fee = Math.round(total * PLATFORM_FEE_RATE * 100) / 100;

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(
          "INSERT INTO orders (buyer_id, total_amount, fee, address) VALUES (?, ?, ?, ?)",
          [req.user.id, total, fee, address || ""],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }
            const orderId = this.lastID;

            const stmt = db.prepare(
              "INSERT INTO order_items (order_id, product_id, merchant_id, quantity, price) VALUES (?, ?, ?, ?, ?)"
            );
            let hasError = false;
            items.forEach((item) => {
              stmt.run(
                [orderId, item.id, item.merchant_id, item.quantity, item.price],
                (err) => {
                  if (err) hasError = true;
                }
              );
            });
            stmt.finalize();

            // 清空购物车
            db.run("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);

            db.run("COMMIT", (err) => {
              if (err || hasError) {
                return res.status(500).json({ error: "订单创建失败" });
              }
              res
                .status(201)
                .json({ id: orderId, total, fee, message: "订单已生成" });
            });
          }
        );
      });
    }
  );
});

// 模拟支付
app.put("/api/orders/:id/pay", authenticateToken, (req, res) => {
  const orderId = req.params.id;
  db.get(
    "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
    [orderId, req.user.id],
    (err, order) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!order) return res.status(404).json({ error: "订单不存在" });
      if (order.status !== "pending_payment")
        return res.status(400).json({ error: "订单状态不允许支付" });

      db.run(
        "UPDATE orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "支付成功（模拟）" });
        }
      );
    }
  );
});

// 用户订单列表
app.get("/api/orders", authenticateToken, (req, res) => {
  db.all(
    `SELECT o.*, COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.buyer_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [req.user.id],
    (err, orders) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(orders);
    }
  );
});

// 订单详情（包括商品明细）
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  const orderId = req.params.id;
  db.get(
    "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
    [orderId, req.user.id],
    (err, order) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!order) return res.status(404).json({ error: "订单不存在" });

      db.all(
        `SELECT oi.*, p.title, p.id as product_id,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) return res.status(500).json({ error: err.message });
          order.items = items;
          res.json(order);
        }
      );
    }
  );
});

// 商户发布商品
app.post(
  "/api/products",
  authenticateToken,
  requireMerchant,
  upload.array("images", 9),
  (req, res) => {
    const { title, description, price, stock, category } = req.body;
    if (!title || !price)
      return res.status(400).json({ error: "标题和价格不能为空" });

    db.run(
      "INSERT INTO products (merchant_id, title, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.merchant.id,
        title,
        description || "",
        parseFloat(price),
        parseInt(stock) || 1,
        category || "其他",
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const productId = this.lastID;

        // 处理图片
        if (req.files && req.files.length > 0) {
          const stmt = db.prepare(
            "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)"
          );
          req.files.forEach((file, index) => {
            stmt.run(productId, `/uploads/${file.filename}`, index);
          });
          stmt.finalize();
        }
        res.status(201).json({ id: productId, message: "商品发布成功" });
      }
    );
  }
);

// 商户获取自己的商品列表（含图片）
app.get(
  "/api/merchant/products",
  authenticateToken,
  requireMerchant,
  (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    db.all(
      `SELECT p.*, (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) as cover_image
     FROM products p WHERE p.merchant_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [req.merchant.id, limit, offset],
      (err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(products);
      }
    );
  }
);

// 商户编辑商品
app.put(
  "/api/products/:id",
  authenticateToken,
  requireMerchant,
  upload.array("newImages", 9),
  (req, res) => {
    const { title, description, price, stock, category, delete_images } =
      req.body;
    const productId = req.params.id;

    // 验证商品所有权
    db.get(
      "SELECT * FROM products WHERE id = ? AND merchant_id = ?",
      [productId, req.merchant.id],
      (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!product)
          return res.status(404).json({ error: "商品不存在或无权限" });

        db.run(
          "UPDATE products SET title = ?, description = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [
            title,
            description,
            parseFloat(price),
            parseInt(stock),
            category,
            productId,
          ],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // 删除指定图片
            const toDelete = delete_images ? JSON.parse(delete_images) : [];
            if (toDelete.length > 0) {
              const placeholders = toDelete.map(() => "?").join(",");
              db.run(
                `DELETE FROM product_images WHERE product_id = ? AND image_url IN (${placeholders})`,
                [productId, ...toDelete]
              );
            }

            // 新增图片
            if (req.files && req.files.length > 0) {
              const stmt = db.prepare(
                "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)"
              );
              req.files.forEach((file, index) => {
                stmt.run(productId, `/uploads/${file.filename}`, 100 + index);
              });
              stmt.finalize();
            }
            res.json({ message: "商品更新成功" });
          }
        );
      }
    );
  }
);

// 商户下架商品 (软删除)
app.delete(
  "/api/products/:id",
  authenticateToken,
  requireMerchant,
  (req, res) => {
    const productId = req.params.id;
    db.run(
      "UPDATE products SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND merchant_id = ?",
      [productId, req.merchant.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0)
          return res.status(404).json({ error: "商品不存在或无权限" });
        res.json({ message: "商品已下架" });
      }
    );
  }
);

// 获取当前商户信息
app.get(
  "/api/merchant/info",
  authenticateToken,
  requireMerchant,
  (req, res) => {
    res.json(req.merchant);
  }
);

app.post("/api/identify", optionalAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "请上传一张玉石照片" });
    }

    const imageUrl = `data:image/jpeg;base64,${image}`;

    // 统一使用完整报告 prompt
    const prompt = `
你是一位玉石分类专家。请观察这张图片，快速识别其中的玉石信息。
请以清晰的结构输出以下内容（Markdown格式）：

### 🔍 识别结果
*   **品种分类**：(如：翡翠、和田玉、玛瑙、独山玉等)
*   **器型类别**：(如：挂件、摆件、手镯、手把件、原石)
*   **雕刻题材**：(如：山水牌、平安扣、叶子、笑佛、龙牌、貔貅等)
*   **材质特征**：(简要描述颜色、质地，如：糯冰种飘花、春带彩、黄翡等)

### 💡 寓意解读
简要说明该题材在中国传统文化中的寓意（如：平安扣寓意岁岁平安，叶子寓意金枝玉叶/一夜成名）。
`;

    console.log("开始识别，用户:", req.user?.username || "未登录");
    const fullReport = await callQwenVision([imageUrl], prompt);
    console.log("识别完成，报告长度:", fullReport.length);

    // 提取品种分类（从报告的第一行“**品种分类**：...”中截取）
    let category = "无法确定";
    const match = fullReport.match(/\*\*品种分类\*\*[：:]\s*(.+)/);
    if (match) {
      category = match[1].trim().replace(/[，,;；].*$/, ""); // 只取第一个逗号前的内容
    }

    // 存入数据库
    const userId = req.user?.id || null;
    const stmt = db.prepare(
      "INSERT INTO analysis_tasks (user_id, image_base64, full_report, category) VALUES (?, ?, ?, ?)"
    );
    stmt.run(userId, image, fullReport, category, function (err) {
      if (err) console.error("保存任务失败:", err);
    });
    stmt.finalize();

    // 等待插入完成（简单处理：直接返回，taskId由客户端再次请求任务详情时使用）
    // 为简化，我们立即返回 taskId
    const taskId = await new Promise((resolve, reject) => {
      db.get("SELECT last_insert_rowid() as id", (err, row) => {
        if (err) reject(err);
        else resolve(row.id);
      });
    });

    res.json({ taskId, category, isFull: false }); // 返回品类，标记未完整
  } catch (error) {
    console.error("识别失败:", error);
    res.status(500).json({ error: error.message || "服务器内部错误" });
  }
});

app.post("/api/tasks/:taskId/pay", authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  db.run(
    "UPDATE analysis_tasks SET is_paid = 1 WHERE id = ? AND user_id = ?",
    [taskId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: "任务不存在或无权操作" });
      }
      res.json({ message: "支付成功", taskId: Number(taskId) });
    }
  );
});

app.get("/api/tasks/:taskId", authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  db.get(
    "SELECT * FROM analysis_tasks WHERE id = ? AND user_id = ?",
    [taskId, req.user.id],
    (err, task) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!task) return res.status(404).json({ error: "任务不存在" });
      if (!task.is_paid) {
        return res.status(402).json({ error: "请先付费解锁" });
      }
      res.json({ fullReport: task.full_report });
    }
  );
});

app.post("/api/unlock-analysis", authenticateToken, (req, res) => {
  console.log(`用户 ${req.user.username} 请求解锁`);
  db.run(
    "UPDATE users SET has_paid_analysis = 1 WHERE id = ?",
    [req.user.id],
    function (err) {
      if (err) {
        console.error("解锁更新失败:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("解锁成功");
      res.json({ message: "支付成功，完整鉴定报告已解锁" });
    }
  );
});
// 发表评论（需要认证）
app.post("/api/posts/:id/comments", authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "评论内容不能为空" });
  }

  db.run(
    "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
    [postId, userId, content.trim()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: "评论成功" });
    }
  );
});

app.get("/api/me", authenticateToken, (req, res) => {
  // 直接使用 req.user 中的信息
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
    has_paid_analysis: req.user.has_paid_analysis,
  });
});

// 获取用户信息（需认证）
app.get("/api/user/profile", authenticateToken, (req, res) => {
  // 可使用 req.user 直接返回
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
    has_paid_analysis: req.user.has_paid_analysis,
  });
});

// 更新用户资料（需认证）
app.put(
  "/api/user/profile",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    const userId = req.user.id;
    const { username, password } = req.body;
    let avatar = null;

    // 如果上传了新头像，保存文件路径
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    // 构建更新语句
    let updateFields = [];
    let updateValues = [];

    if (username && username !== req.user.username) {
      // 检查用户名是否已存在
      const existing = await new Promise((resolve) => {
        db.get(
          "SELECT id FROM users WHERE username = ? AND id != ?",
          [username, userId],
          (err, row) => {
            resolve(row);
          }
        );
      });
      if (existing) {
        return res.status(400).json({ error: "用户名已存在" });
      }
      updateFields.push("username = ?");
      updateValues.push(username);
    }

    if (avatar) {
      updateFields.push("avatar = ?");
      updateValues.push(avatar);
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password_hash = ?");
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "没有要更新的信息" });
    }

    updateValues.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    db.run(sql, updateValues, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // 返回更新后的用户信息（不包含密码）
      db.get(
        "SELECT id, username, avatar FROM users WHERE id = ?",
        [userId],
        (err, user) => {
          if (err) return res.status(500).json({ error: err.message });
          // 如果用户名变更，需要生成新 token
          if (username && username !== req.user.username) {
            const newToken = jwt.sign(
              { id: user.id, username: user.username },
              JWT_SECRET,
              { expiresIn: "7d" }
            );
            res.json({ user, token: newToken });
          } else {
            res.json({ user });
          }
        }
      );
    });
  }
);

// 签名工具函数
function hmacSha256(key, msg) {
  return crypto.createHmac("sha256", key).update(msg).digest();
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmacSha256(secretKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "request");
}

function sha256Hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function formatQuery(parameters) {
  const sortedKeys = Object.keys(parameters).sort();
  const parts = [];
  for (const key of sortedKeys) {
    parts.push(`${key}=${encodeURIComponent(parameters[key])}`);
  }
  return parts.join("&");
}

async function volcanoRequest(method, action, version, queryParams, bodyData) {
  const date = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const shortDate = date.slice(0, 8);
  const payload = JSON.stringify(bodyData);
  const payloadHash = sha256Hash(payload);

  // 合并 Query 参数
  const allQuery = { ...queryParams, Action: action, Version: version };
  const canonicalQueryString = formatQuery(allQuery);

  const canonicalHeaders = [
    `content-type:application/json`,
    `host:${VOLCANO_HOST}`,
    `x-content-sha256:${payloadHash}`,
    `x-date:${date}`,
  ].join("\n");

  const signedHeaders = "content-type;host;x-content-sha256;x-date";
  const canonicalRequest = [
    method,
    "/",
    canonicalQueryString,
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const hashedCanonicalRequest = sha256Hash(canonicalRequest);
  const credentialScope = `${shortDate}/${VOLCANO_REGION}/${VOLCANO_SERVICE}/request`;
  const stringToSign = [
    "HMAC-SHA256",
    date,
    credentialScope,
    hashedCanonicalRequest,
  ].join("\n");

  const signingKey = getSignatureKey(
    VOLCANO_SK,
    shortDate,
    VOLCANO_REGION,
    VOLCANO_SERVICE
  );
  const signature = hmacSha256(signingKey, stringToSign).toString("hex");

  const authorization = `HMAC-SHA256 Credential=${VOLCANO_AK}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${VOLCANO_HOST}/?${canonicalQueryString}`;
  try {
    const response = await axios({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        Host: VOLCANO_HOST,
        "X-Content-Sha256": payloadHash,
        "X-Date": date,
        Authorization: authorization,
      },
      data: payload,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorStr = JSON.stringify(errorData);
      if (errorStr.length > 500) {
        errorStr = errorStr.slice(0, 500) + "... (truncated)";
      }
      console.error("火山API响应错误:", error.response.status, errorStr);
    } else if (error.request) {
      console.error("火山API无响应:", error.message);
    } else {
      console.error("火山API请求错误:", error.message);
    }
    throw error;
  }
}

// 提交任务
async function submitTryOnTask(imageUrls, prompt) {
  const body = {
    req_key: "jimeng_t2i_v40",
    image_urls: imageUrls,
    prompt: prompt,
    scale: 0.7,
    force_single: true,
  };
  const result = await volcanoRequest(
    "POST",
    "CVSync2AsyncSubmitTask",
    "2022-08-31",
    {},
    body
  );
  console.log("提交任务返回:", JSON.stringify(result, null, 2));
  if (result.code !== 10000) {
    throw new Error(`提交失败: ${result.message}`);
  }
  return result.data.task_id;
}

async function getTaskResult(taskId, maxRetries = 30, interval = 1500) {
  const body = {
    req_key: "jimeng_t2i_v40",
    task_id: taskId,
  };
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    const result = await volcanoRequest(
      "POST",
      "CVSync2AsyncGetResult",
      "2022-08-31",
      {},
      body
    );
    if (result.code !== 10000) {
      throw new Error(`查询失败: ${result.message}`);
    }
    const { status, image_urls, binary_data_base64 } = result.data;
    console.log(
      `轮询状态: ${status}${image_urls ? ` 图片数: ${image_urls.length}` : ""}${
        binary_data_base64 ? ` base64存在` : ""
      }`
    );

    if (status === "done") {
      console.log(
        "任务完成，返回结果（仅显示前200字符）:",
        JSON.stringify(result.data).slice(0, 200)
      );
      if (image_urls && image_urls.length > 0) {
        return image_urls[0];
      } else if (binary_data_base64 && binary_data_base64.length > 0) {
        // 返回完整的 data URL
        const base64Data = binary_data_base64[0];
        return `data:image/png;base64,${base64Data}`;
      } else {
        throw new Error("任务完成但未返回图片");
      }
    } else if (status === "failed") {
      throw new Error("图像生成失败");
    }
  }
  throw new Error("任务超时");
}

async function saveBase64Image(base64, ext = "jpg") {
  const buffer = Buffer.from(base64, "base64");
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 8)}.${ext}`;
  const filePath = path.join(__dirname, "uploads", filename);
  await writeFileAsync(filePath, buffer);
  return `/uploads/${filename}`; // 改为相对路径
}

// 新增上传到 imgbb 的函数
async function uploadToImgbb(base64Data) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("请配置 IMGBB_API_KEY 环境变量");
  }
  const form = new FormData();
  form.append("key", apiKey);
  // 移除 base64 的前缀（如果有）
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  form.append("image", cleanBase64);
  const response = await axios.post("https://api.imgbb.com/1/upload", form, {
    headers: form.getHeaders(),
    timeout: 30000,
  });
  if (response.data.success) {
    return response.data.data.url;
  } else {
    throw new Error(
      `图床上传失败: ${response.data.error?.message || "未知错误"}`
    );
  }
}

app.post("/api/tryon", async (req, res) => {
  console.log("收到 AI 试戴请求");
  try {
    const { personImage, jadeImage, prompt } = req.body;
    if (!personImage || !jadeImage) {
      return res.status(400).json({ error: "请同时上传人物照片和玉石照片" });
    }

    const personUrl = await uploadToImgbb(personImage);
    const jadeUrl = await uploadToImgbb(jadeImage);
    console.log("图片已上传到公网:", personUrl, jadeUrl);

    const userPrompt =
      prompt ||
      "把图2中的玉石佩戴在图1的人物身上，不要改变图1原本的画幅，以及人物原本的姿势。不要改变原本玉石的颜色。如果佩戴在胸前，请缩小尺寸。";
    const taskId = await submitTryOnTask([personUrl, jadeUrl], userPrompt);
    console.log("任务已提交，taskId:", taskId);

    const resultImageUrl = await getTaskResult(taskId);
    console.log("生成图片 URL (前100):", resultImageUrl.slice(0, 100) + "...");

    let imageBase64 = null;
    let finalImageUrl = null;
    if (resultImageUrl && resultImageUrl.startsWith("data:")) {
      const match = resultImageUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (match && match[1]) {
        imageBase64 = match[1];
        finalImageUrl = resultImageUrl;
      } else {
        imageBase64 = resultImageUrl;
      }
    } else if (resultImageUrl) {
      // 如果是普通 HTTP URL，尝试下载
      try {
        const imgResponse = await axios.get(resultImageUrl, {
          responseType: "arraybuffer",
        });
        imageBase64 = Buffer.from(imgResponse.data).toString("base64");
        finalImageUrl = resultImageUrl;
      } catch (e) {
        console.warn("无法下载图片，将返回 URL", e.message);
        // 仍然返回 URL，前端可处理
        finalImageUrl = resultImageUrl;
      }
    }

    res.json({
      image: imageBase64,
      imageUrl: finalImageUrl,
      description: "",
    });
  } catch (error) {
    console.error("AI试戴生成失败:", error);
    res.status(500).json({ error: error.message || "AI服务异常" });
  }
});
// 点赞/取消点赞
app.post("/api/posts/:id/like", authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  // 检查是否已经点赞
  db.get(
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
    [userId, postId],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing) {
        // 已经点赞，则取消点赞
        db.run(
          "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
          [userId, postId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            // 更新帖子点赞数
            db.run(
              "UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE post_id = ?) WHERE id = ?",
              [postId, postId],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });
                // 返回最新状态
                db.get(
                  "SELECT likes FROM posts WHERE id = ?",
                  [postId],
                  (err, row) => {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    res.json({ liked: false, likes: row.likes });
                  }
                );
              }
            );
          }
        );
      } else {
        // 未点赞，添加点赞
        db.run(
          "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
          [userId, postId],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run(
              "UPDATE posts SET likes = (SELECT COUNT(*) FROM likes WHERE post_id = ?) WHERE id = ?",
              [postId, postId],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });
                db.get(
                  "SELECT likes FROM posts WHERE id = ?",
                  [postId],
                  (err, row) => {
                    if (err)
                      return res.status(500).json({ error: err.message });
                    res.json({ liked: true, likes: row.likes });
                  }
                );
              }
            );
          }
        );
      }
    }
  );
});

app.use("/uploads", express.static("uploads"));

// ---------- 测试路由 ----------
app.get("/api/test", (req, res) => {
  res.json({ message: "后端已启动" });
});

// ---------- 获取帖子列表 ----------
app.get("/api/posts", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 获取当前用户 ID（从 token 中获取）
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  const sql = `
  SELECT p.*, u.username, u.avatar,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
    (SELECT image_url FROM post_images WHERE post_id = p.id LIMIT 1) AS first_image,
    EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) AS has_liked
  FROM posts p
  JOIN users u ON p.user_id = u.id
  ORDER BY p.created_at DESC
  LIMIT ? OFFSET ?
`;
  db.all(sql, [userId, limit, offset], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});
// 删除帖子（需认证，仅作者可删）
app.delete("/api/posts/:id", authenticateToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  // 检查帖子是否存在且属于当前用户
  db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: "帖子不存在" });
    if (post.user_id !== userId) {
      return res.status(403).json({ error: "无权删除此帖子" });
    }

    // 删除帖子（由于外键级联，关联的图片和评论会自动删除）
    db.run("DELETE FROM posts WHERE id = ?", [postId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "帖子已删除" });
    });
  });
});
// 获取单个帖子详情（包含图片和评论）
app.get("/api/posts/:id", (req, res) => {
  const postId = req.params.id;

  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  // 先查询帖子基本信息
  db.get(
    `
    SELECT p.*, u.username, u.avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
    `,
    [postId],
    (err, post) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!post) {
        return res.status(404).json({ error: "帖子不存在" });
      }

      // 查询当前用户是否点赞
      if (userId) {
        db.get(
          "SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?",
          [userId, postId],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            post.has_liked = !!row;
            fetchImagesAndComments(postId, post, res);
          }
        );
      } else {
        post.has_liked = false;
        fetchImagesAndComments(postId, post, res);
      }
    }
  );

  function fetchImagesAndComments(postId, post, res) {
    // 查询图片
    db.all(
      "SELECT image_url FROM post_images WHERE post_id = ?",
      [postId],
      (err, images) => {
        if (err) return res.status(500).json({ error: err.message });
        // 查询评论（包含用户头像）
        db.all(
          `
          SELECT c.*, u.username, u.avatar
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.created_at ASC
          `,
          [postId],
          (err, comments) => {
            if (err) return res.status(500).json({ error: err.message });
            const result = {
              ...post,
              images: images.map((img) => img.image_url),
              replies: comments.map((c) => ({
                id: c.id,
                author: c.username,
                content: c.content,
                created_at: c.created_at,
                avatar: c.avatar,
              })),
            };
            res.json(result);
          }
        );
      }
    );
  }
});

// 更新帖子（需认证，仅作者可修改，支持图片管理）
app.put(
  "/api/posts/:id",
  authenticateToken,
  updateUpload.array("newImages", 10),
  async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { title, content, delete_images } = req.body; // delete_images 是 JSON 字符串数组
    console.log("接收到的 delete_images:", delete_images);
    console.log("接收到的文件数:", req.files?.length);
    if (!title || !content) {
      return res.status(400).json({ error: "标题和内容不能为空" });
    }

    // 检查帖子是否存在且属于当前用户
    db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!post) return res.status(404).json({ error: "帖子不存在" });
      if (post.user_id !== userId) {
        return res.status(403).json({ error: "无权编辑此帖子" });
      }

      // 更新标题和内容
      db.run(
        "UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, content, postId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          // 处理删除的图片
          const toDelete = delete_images ? JSON.parse(delete_images) : [];
          if (toDelete.length > 0) {
            const placeholders = toDelete.map(() => "?").join(",");
            db.run(
              `DELETE FROM post_images WHERE post_id = ? AND image_url IN (${placeholders})`,
              [postId, ...toDelete],
              (err) => {
                if (err) console.error("删除图片失败:", err);
              }
            );
          }

          // 处理新上传的图片
          if (req.files && req.files.length > 0) {
            const imageStmt = db.prepare(
              "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)"
            );
            req.files.forEach((file) => {
              const imageUrl = "/uploads/" + file.filename; // 注意：filename 应包含扩展名
              imageStmt.run(postId, imageUrl);
            });
            imageStmt.finalize();
          }

          res.json({ message: "帖子已更新" });
        }
      );
    });
  }
);

// 删除评论（需认证，仅评论作者可删）
app.delete("/api/comments/:id", authenticateToken, (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  // 检查评论是否存在且属于当前用户
  db.get(
    "SELECT user_id FROM comments WHERE id = ?",
    [commentId],
    (err, comment) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!comment) return res.status(404).json({ error: "评论不存在" });
      if (comment.user_id !== userId) {
        return res.status(403).json({ error: "无权删除此评论" });
      }

      db.run("DELETE FROM comments WHERE id = ?", [commentId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "评论已删除" });
      });
    }
  );
});

// ---------- 注册 ----------
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码不能为空" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "密码加密失败" });
    }

    db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hash],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "用户名已存在" });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, username });
      }
    );
  });
});

// ---------- 登录 ----------
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码不能为空" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "密码验证失败" });
      }
      if (!result) {
        return res.status(401).json({ error: "用户名或密码错误" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  });
});

// ---------- 发帖（需要认证）----------
app.post(
  "/api/posts",
  authenticateToken,
  upload.array("images", 9),
  (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: "标题和内容不能为空" });
    }

    db.run(
      "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        const postId = this.lastID;

        if (req.files && req.files.length > 0) {
          const imageStmt = db.prepare(
            "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)"
          );
          req.files.forEach((file) => {
            const imageUrl = "/uploads/" + file.filename;
            imageStmt.run(postId, imageUrl);
          });
          imageStmt.finalize();
        }

        res.status(201).json({ id: postId, message: "发帖成功" });
      }
    );
  }
);

// ---------- 获取当前用户信息 ----------
app.get("/api/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

// ---------- 启动服务器 ----------
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
  if (err) {
    console.error("查询表失败:", err);
  } else {
    console.log("数据库表存在");
  }
});
