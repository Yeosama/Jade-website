// server/jimeng.js (独立模块)
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 缓存浏览器实例（复用，避免每次都启动新浏览器）
let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,  // 调试时可设为 false 观察操作
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

/**
 * 自动化即梦 AI 生成图片
 * @param {string} personImagePath - 人物图片本地路径
 * @param {string} jadeImagePath - 玉石图片本地路径
 * @param {string} prompt - 用户提示词（可选）
 * @returns {Promise<string>} 生成的图片 URL（或 base64）
 */
async function automateJimeng(personImagePath, jadeImagePath, prompt = '') {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewport({ width: 1280, height: 800 });
  
  // 打开即梦 AI 页面
  await page.goto('https://jimeng.jianying.com/ai-tool/generate?workspace=0', {
    waitUntil: 'networkidle2'
  });
  
  // 1. 处理登录（如果需要）
  // 方式：检查是否已登录，否则等待用户手动登录
  const isLoggedIn = await page.evaluate(() => {
    // 通过页面特征判断是否已登录，例如查找用户头像
    return document.querySelector('.user-avatar') !== null;
  });
  
  if (!isLoggedIn) {
    console.log('请手动登录...');
    // 等待用户手动登录，例如等待 60 秒
    await page.waitForSelector('.user-avatar', { timeout: 60000 });
  }
  
  // 2. 定位并点击可编辑区域（激活输入框）
  await page.waitForSelector('div[contenteditable="true"][role="textbox"]');
  await page.click('div[contenteditable="true"][role="textbox"]');
  
  // 3. 上传图片（使用文件 input）
  // 寻找隐藏的文件上传 input（可能有多个，需要精确选择）
  const fileInputs = await page.$$('input[type="file"]');
  if (fileInputs.length >= 2) {
    // 第一个上传人物图
    await fileInputs[0].uploadFile(personImagePath);
    await page.waitForTimeout(1000); // 等待上传完成
    // 第二个上传玉石图
    await fileInputs[1].uploadFile(jadeImagePath);
    await page.waitForTimeout(1000);
  } else {
    throw new Error('未找到文件上传元素');
  }
  
  // 4. 填写提示词
  const defaultPrompt = prompt || "把图2的饰品戴在图1的人物身上，保持自然";
  await page.keyboard.type(defaultPrompt);
  
  // 5. 点击生成按钮
  await page.waitForSelector('button.submit-button-xdhu0e');
  await page.click('button.submit-button-xdhu0e');
  
  // 6. 等待生成完成，获取最后一张图片的 URL
  // 等待结果区域出现图片
  await page.waitForSelector('.agentic-record-content-Bgk_hF .image-eTuIBd', { timeout: 120000 });
  
  // 获取最后一张图片的 src 属性
  const imageUrl = await page.evaluate(() => {
    const images = document.querySelectorAll('.agentic-record-content-Bgk_hF .image-eTuIBd');
    if (images.length === 0) return null;
    const lastImg = images[images.length - 1];
    return lastImg.src;
  });
  
  if (!imageUrl) {
    throw new Error('未获取到生成的图片 URL');
  }
  
  // 7. 关闭页面（保留浏览器实例）
  await page.close();
  
  return imageUrl;
}

module.exports = { automateJimeng };