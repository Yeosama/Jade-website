const bcrypt = require('bcrypt');
const db = require('./db');

// 图片存放目录（相对于 server/uploads/）
const IMAGE_DIR = '/uploads/products/';

async function seed() {
  console.log('开始生成假数据...');

  // ========== 1. 创建两个商户用户 (密码均为 123456) ==========
  const passwordHash = await bcrypt.hash('123456', 10);
  const merchantUsers = [
    { username: '翠宝阁', role: 'merchant' },
    { username: '玉缘坊', role: 'merchant' },
  ];

  for (const m of merchantUsers) {
    const existing = await new Promise((resolve) => {
      db.get('SELECT id FROM users WHERE username = ?', [m.username], (err, row) => resolve(row));
    });
    if (!existing) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
          [m.username, passwordHash, m.role],
          function (err) {
            if (err) reject(err);
            else {
              console.log('创建用户:', m.username, 'ID:', this.lastID);
              resolve(this.lastID);
            }
          }
        );
      });
    }
  }

  // ========== 2. 创建商户记录 ==========
  const expireDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const merchantShops = [
    { username: '翠宝阁', shop_name: '翠宝阁精品玉器', description: '专注高冰种翡翠挂件，四会源头好货', contact: '13800001111' },
    { username: '玉缘坊', shop_name: '玉缘坊老店', description: '四会本地源头批发，和田玉、翡翠、黄龙玉一应俱全', contact: '13800002222' },
  ];

  const merchantIds = {}; // 存储 username -> merchant_id 映射

  for (const m of merchantShops) {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', [m.username], (err, row) => {
        if (err || !row) reject('用户不存在');
        else resolve(row);
      });
    });

    const existingMerchant = await new Promise((resolve) => {
      db.get('SELECT id FROM merchants WHERE user_id = ?', [user.id], (err, row) => resolve(row));
    });

    if (!existingMerchant) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO merchants (user_id, shop_name, description, contact, expire_date) VALUES (?, ?, ?, ?, ?)',
          [user.id, m.shop_name, m.description, m.contact, expireDate],
          function (err) {
            if (err) reject(err);
            else {
              console.log('创建商户:', m.shop_name, 'ID:', this.lastID);
              merchantIds[m.username] = this.lastID;
              resolve();
            }
          }
        );
      });
    } else {
      merchantIds[m.username] = existingMerchant.id;
      console.log('商户已存在:', m.shop_name, 'ID:', existingMerchant.id);
    }
  }

  // ========== 3. 插入商品 ==========
  console.log('\n开始插入商品...\n');

  const products = [
    {
      merchant_username: '翠宝阁',
      title: '冰种飘花平安扣',
      description: '质地细腻冰透，飘花灵动自然，寓意平安吉祥。精选四会老坑冰种料，水头足，起光好，佩戴优雅大方。',
      price: 2888,
      stock: 5,
      category: '挂件',
      images: ['翡翠_冰种飘花_133_1.jpg'],
    },
    {
      merchant_username: '翠宝阁',
      title: '高冰观音牌',
      description: '玻璃种白冰底，通透如镜，观音开脸慈祥端庄。四会名师精工雕刻，线条流畅，背面可见荧光反应。',
      price: 5600,
      stock: 3,
      category: '挂件',
      images: ['翡翠_玻璃种白冰_0003.jpg'],
    },
    {
      merchant_username: '翠宝阁',
      title: '冰种飘花手镯',
      description: '圈口56mm，冰糯种飘蓝花，整圈均匀无裂。上手温润显肤色，是日常佩戴与收藏的佳品。',
      price: 16800,
      stock: 2,
      category: '手镯',
      images: ['翡翠_冰种飘花_1_1.jpg'],
    },
    {
      merchant_username: '翠宝阁',
      title: '冰种苹果绿挂坠',
      description: '小巧精致的苹果绿翡翠挂坠，色泽清新明亮。水头足，起荧光，适合镶嵌或直接佩戴。',
      price: 3200,
      stock: 6,
      category: '挂件',
      images: ['翡翠_冰种苹果绿_13.jpg'],
    },
    {
      merchant_username: '玉缘坊',
      title: '紫罗兰翡翠挂坠',
      description: '玻璃种紫罗兰底，粉紫温柔浪漫，见光不死。随形雕刻，意境优美，是春夏搭配的点睛之笔。',
      price: 8800,
      stock: 2,
      category: '挂件',
      images: ['翡翠_玻璃种紫罗兰_0002.jpg'],
    },
    {
      merchant_username: '玉缘坊',
      title: '和田玉观音牌',
      description: '新疆和田玉碧玉料，色正肉细，油润感十足。观音法相庄严，背面素净，适合贴身佩戴。',
      price: 4200,
      stock: 4,
      category: '挂件',
      images: ['和田玉_碧玉_10.jpg'],
    },
    {
      merchant_username: '玉缘坊',
      title: '黄龙玉冰黄手镯',
      description: '云南黄龙玉冰黄料，色泽如蜜，质地细腻通透。圈口58mm，上手富贵大气，彰显品味。',
      price: 2600,
      stock: 8,
      category: '手镯',
      images: ['黄龙玉-冰黄_0006.jpg'],
    },
    {
      merchant_username: '玉缘坊',
      title: '玛瑙原石摆件',
      description: '天然南红玛瑙红白料，纹理独特如山水画卷。配实木底座，适合案头摆放观赏，意境悠远。',
      price: 980,
      stock: 10,
      category: '摆件',
      images: ['nanhongmanao-hongbailiao_0eb9e7f483c1_white.jpg'],
    },
  ];

  for (const p of products) {
    const merchantId = merchantIds[p.merchant_username];
    if (!merchantId) {
      console.error('商户不存在:', p.merchant_username);
      continue;
    }

    const productId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO products (merchant_id, title, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)',
        [merchantId, p.title, p.description, p.price, p.stock, p.category],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log(`✅ [${p.merchant_username}] ${p.title} (ID:${productId})`);

    // 插入图片
    for (let idx = 0; idx < p.images.length; idx++) {
      const imageUrl = IMAGE_DIR + p.images[idx];
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [productId, imageUrl, idx],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log(`   📷 ${imageUrl}`);
    }
  }

  console.log('\n🎉 假数据插入全部完成！');
  console.log('   商户登录账号：翠宝阁 / 玉缘坊');
  console.log('   商户登录密码：123456');
  console.log('   图片请放置在 server/uploads/products/ 目录下');
}

seed().catch(err => {
  console.error('Seed 失败:', err);
  process.exit(1);
});