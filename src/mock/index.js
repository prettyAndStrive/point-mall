// src/mock/index.js

// 模拟商品数据
const products = [
  { id: 1, name: '机械键盘', description: '青轴RGB机械键盘，打字声音清脆。', imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80', points: 2000, stock: 10, isHot: true, category: '数码' },
  { id: 2, name: '蓝牙耳机', description: '主动降噪，长续航，沉浸式体验。', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', points: 3500, stock: 5, isHot: true, category: '数码' },
  { id: 3, name: '定制马克杯', description: '陶瓷材质，可定制图案。', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80', points: 500, stock: 50, isHot: false, category: '家居' },
  { id: 4, name: '便携充电宝', description: '10000mAh大容量，轻薄便携。', imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80', points: 1500, stock: 20, isHot: true, category: '数码' },
  { id: 5, name: '桌面加湿器', description: '静音设计，滋润空气。', imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80', points: 800, stock: 30, isHot: false, category: '家电' },
  { id: 6, name: '双肩背包', description: '防泼水面料，大容量。', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', points: 4500, stock: 8, isHot: true, category: '箱包' },
  { id: 7, name: '智能手环', description: '心率监测，运动追踪。', imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80', points: 2200, stock: 15, isHot: true, category: '数码' },
  { id: 8, name: '护眼台灯', description: '无频闪，多档亮度调节。', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80', points: 1200, stock: 25, isHot: false, category: '家电' }
]

// 模拟用户数据
const userInfo = { id: 1, username: '测试用户', points: 10000 }

// 模拟购物车数据
let cartItems = [
  { id: 101, productId: 1, productName: '机械键盘', points: 2000, quantity: 1 }
]

// 模拟订单数据
const orders = [
  { id: 20231001, productName: '定制马克杯', costPoints: 500, status: '已完成', createTime: '2023-10-01 10:00:00' }
]

// 辅助函数：提取 URL 最后的数字 ID
const getIdFromUrl = (url) => {
  const parts = url.split('/');
  return parseInt(parts.pop());
}

// 导出拦截器主函数
export default function(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { url, method } = config;
      let parsedData = {};
      try {
        parsedData = config.data ? JSON.parse(config.data) : {};
      } catch (e) {
        parsedData = config.data || {};
      }

      // ------------------ 接口匹配开始 ------------------

      // 0. 首页数据聚合接口 (最关键)
      if (url.includes('/home/data') && method === 'get') {
        const homeData = {
          categories: [
            { name: '热门推荐', icon: 'el-icon-star-on', floorId: 'floor-hot' },
            { name: '数码外设', icon: 'el-icon-monitor', floorId: 'floor-digital' },
            { name: '家居生活', icon: 'el-icon-coffee-cup', floorId: 'floor-home' },
            { name: '家用电器', icon: 'el-icon-s-platform', floorId: 'floor-appliance' },
            { name: '箱包出行', icon: 'el-icon-suitcase', floorId: 'floor-bag' }
          ],
          banners: [
            { imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80' },
            { imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
            { imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80' }
          ],
          floors: [
            { id: 'floor-hot', title: '🔥 热门兑换', products: products.filter(p => p.isHot) },
            { id: 'floor-digital', title: '💻 数码专场', products: products.filter(p => p.category === '数码') },
            { id: 'floor-home', title: '🏠 家居生活', products: products.filter(p => p.category === '家居') },
            { id: 'floor-appliance', title: '💡 家用电器', products: products.filter(p => p.category === '家电') },
            { id: 'floor-bag', title: '🎒 箱包出行', products: products.filter(p => p.category === '箱包') }
          ]
        };
        return resolve({ status: 200, data: { code: 200, data: homeData } });
      }

      // 1. 登录接口
      if (url.includes('/auth/login') && method === 'post') {
        return resolve({ status: 200, data: { code: 200, data: { token: 'fake-jwt-token-123', userInfo } } });
      }

      // 2. 注册接口
      if (url.includes('/auth/register') && method === 'post') {
        return resolve({ status: 200, data: { code: 200, message: '注册成功' } });
      }

      // 3. 获取用户信息
      if (url.includes('/users/profile') && method === 'get') {
        return resolve({ status: 200, data: { code: 200, data: userInfo } });
      }

      // 4. 获取热门商品 (旧接口，保留兼容)
      if (url.includes('/products/hot') && method === 'get') {
        return resolve({ status: 200, data: { code: 200, data: products.filter(p => p.isHot) } });
      }

      // 5. 获取商品列表
      if (url.includes('/products') && method === 'get' && !url.includes('/hot') && !url.includes('/home')) {
        return resolve({ status: 200, data: { code: 200, data: { list: products, total: products.length } } });
      }

      // 6. 获取商品详情
      if (url.match(/\/products\/\d+$/) && method === 'get') {
        const id = getIdFromUrl(url);
        const product = products.find(p => p.id === id);
        if (product) return resolve({ status: 200, data: { code: 200, data: product } });
      }

      // 7. 获取购物车数量
      if (url.includes('/cart/count') && method === 'get') {
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return resolve({ status: 200, data: { code: 200, data: { count } } });
      }

      // 8. 获取购物车列表
      if (url.includes('/cart') && method === 'get' && !url.includes('count')) {
        return resolve({ status: 200, data: { code: 200, data: cartItems } });
      }

      // 9. 添加到购物车
      if (url === '/api/cart' && method === 'post') {
        const { productId, quantity } = parsedData;
        const product = products.find(p => p.id === Number(productId));
        if (!product) return resolve({ status: 400, data: { message: '商品不存在' } });

        const existItem = cartItems.find(item => item.productId === product.id);
        if (existItem) {
          existItem.quantity += quantity;
        } else {
          cartItems.push({ id: Date.now(), productId: product.id, productName: product.name, points: product.points, quantity });
        }
        return resolve({ status: 200, data: { code: 200, message: '已加入购物车' } });
      }

      // 10. 修改购物车数量
      if (url.match(/\/cart\/\d+$/) && method === 'put') {
        const id = getIdFromUrl(url);
        const item = cartItems.find(i => i.id === id);
        if (item) item.quantity = parsedData.quantity;
        return resolve({ status: 200, data: { code: 200, message: '修改成功' } });
      }

      // 11. 删除购物车商品
      if (url.match(/\/cart\/\d+$/) && method === 'delete') {
        const id = getIdFromUrl(url);
        cartItems = cartItems.filter(i => i.id !== id);
        return resolve({ status: 200, data: { code: 200, message: '删除成功' } });
      }

      // 12. 结算兑换
      if (url.includes('/orders/checkout') && method === 'post') {
        const totalCost = cartItems.reduce((sum, item) => sum + item.points * item.quantity, 0);
        if (userInfo.points < totalCost) {
          return resolve({ status: 400, data: { message: '积分不足，兑换失败！' } });
        }
        userInfo.points -= totalCost;
        orders.unshift({
          id: Date.now(),
          productName: cartItems.map(i => i.productName).join(','),
          costPoints: totalCost,
          status: '已完成',
          createTime: new Date().toLocaleString()
        });
        cartItems = [];
        return resolve({ status: 200, data: { code: 200, data: { orderId: Date.now(), message: '兑换成功' } } });
      }

      // 13. 获取订单列表
      if (url.includes('/orders') && method === 'get') {
        return resolve({ status: 200, data: { code: 200, data: orders } });
      }

      // 兜底：如果都没有匹配上，返回空数据，防止报错
      console.warn('Mock: 未匹配到接口 =>', method, url);
      resolve({ status: 200, data: { code: 200, data: null } });

    }, 300); // 模拟网络延迟
  });
}
