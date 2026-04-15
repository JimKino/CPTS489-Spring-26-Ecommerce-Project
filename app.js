const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// ------------------------
// App setup
// ------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'grocery-store-secret',
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------
// Temporary in-memory data
// ------------------------
let users = [
  {
    id: 1,
    fname: 'Admin',
    lname: 'User',
    email: 'admin@grocery.com',
    password: 'admin123',
    role: 'admin',
    shippingAddress: '123 Admin St, Pullman, WA',
    cards: [{ name: 'Admin Visa', type: 'Visa', last4: '1111' }]
  },
  {
    id: 2,
    fname: 'Seller',
    lname: 'One',
    email: 'seller@grocery.com',
    password: 'seller123',
    role: 'seller',
    shippingAddress: '456 Seller Ave, Pullman, WA',
    cards: [{ name: 'Seller Visa', type: 'Visa', last4: '2222' }]
  },
  {
    id: 3,
    fname: 'Alice',
    lname: 'Johnson',
    email: 'alice@email.com',
    password: 'alice123',
    role: 'customer',
    shippingAddress: '789 Customer Rd, Pullman, WA',
    cards: [{ name: 'Main Credit', type: 'Visa', last4: '3333' }]
  }
];

let products = [
  {
    id: 1,
    name: 'Carrots',
    price: 10.0,
    desc: 'Fresh carrots',
    stock: 10,
    sellerId: 2,
    image: '/images/Carrot.png',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Milk 2%',
    price: 4.49,
    desc: 'Fresh milk 1 gallon',
    stock: 7,
    sellerId: 2,
    image: '/images/Carrot.png',
    status: 'Draft'
  },
  {
    id: 3,
    name: 'Organic Apples',
    price: 3.99,
    desc: 'Organic apples 1 lb',
    stock: 12,
    sellerId: 2,
    image: '/images/Carrot.png',
    status: 'Active'
  }
];

let reviews = [
  {
    id: 1,
    productId: 1,
    userId: 3,
    rating: 4,
    header: 'Good carrots',
    body: 'Fresh and crunchy.',
    flagged: false
  },
  {
    id: 2,
    productId: 3,
    userId: 3,
    rating: 2,
    header: 'Late delivery',
    body: 'The apples were okay, but delivery was slow.',
    flagged: true
  }
];

let orders = [
  {
    id: 1001,
    userId: 3,
    items: [{ productId: 1, quantity: 2, price: 10.0 }],
    subtotal: 20.0,
    tax: 1.6,
    total: 21.6,
    date: '2026-03-03',
    status: 'Pending',
    shippingAddress: '789 Customer Rd, Pullman, WA',
    paymentUsed: 'Visa ****3333'
  }
];

// ------------------------
// Helpers
// ------------------------
function getCurrentUser(req) {
  if (!req.session.userId) return null;
  return users.find(u => u.id === req.session.userId) || null;
}

function requireLogin(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) return res.redirect('/');
  res.locals.currentUser = user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    const user = getCurrentUser(req);
    if (!user) return res.redirect('/');
    if (user.role !== role) {
      return res.status(403).render('error', {
        message: 'Access denied',
        error: { status: 403, stack: '' }
      });
    }
    res.locals.currentUser = user;
    next();
  };
}

function ensureCart(req) {
  if (!req.session.cart) req.session.cart = [];
}

function getCartDetails(req) {
  ensureCart(req);
  return req.session.cart
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        desc: product.desc,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);
}

function cartTotals(cartItems) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax, total };
}

app.use((req, res, next) => {
  res.locals.currentUser = getCurrentUser(req);
  next();
});

// ------------------------
// Public routes
// ------------------------
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null, formData: {} });
});

app.post('/register', (req, res) => {
  const { fname, lname, email, password, role, loginAuto } = req.body;

  if (!fname || !lname || !email || !password || !role) {
    return res.render('register', {
      error: 'All fields are required.',
      formData: req.body
    });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.render('register', {
      error: 'Email already exists.',
      formData: req.body
    });
  }

  const newUser = {
    id: users.length + 1,
    fname,
    lname,
    email,
    password,
    role,
    shippingAddress: '',
    cards: []
  };

  users.push(newUser);

  if (loginAuto) {
    req.session.userId = newUser.id;
    return res.redirect('/home');
  }

  res.redirect('/');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
  );

  if (!user) {
    return res.render('index', { error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  res.redirect('/home');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ------------------------
// Customer routes
// ------------------------
app.get('/home', requireLogin, (req, res) => {
  const activeProducts = products.filter(p => p.status !== 'Deleted');
  res.render('home', { products: activeProducts });
});

app.get('/search', requireLogin, (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const filtered = products.filter(p => {
    if (p.status === 'Deleted') return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  });

  res.render('search', {
    products: filtered,
    q: req.query.q || '',
    noResults: filtered.length === 0
  });
});

app.get('/products/:id', requireLogin, (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId && p.status !== 'Deleted');

  if (!product) {
    return res.status(404).render('error', {
      message: 'Product not found',
      error: { status: 404, stack: '' }
    });
  }

  const productReviews = reviews
    .filter(r => r.productId === productId)
    .map(r => {
      const user = users.find(u => u.id === r.userId);
      return {
        ...r,
        userName: user ? `${user.fname} ${user.lname}` : 'Unknown User'
      };
    });

  res.render('productPage', { product, reviews: productReviews });
});

app.post('/cart/add', requireLogin, (req, res) => {
  ensureCart(req);
  const productId = parseInt(req.body.productId, 10);
  const product = products.find(p => p.id === productId && p.status !== 'Deleted');

  if (!product) {
    return res.status(404).render('error', {
      message: 'Product not found',
      error: { status: 404, stack: '' }
    });
  }

  if (product.stock <= 0) {
    return res.status(400).render('error', {
      message: 'Item is out of stock',
      error: { status: 400, stack: '' }
    });
  }

  const existingItem = req.session.cart.find(item => item.productId === productId);
  if (existingItem) {
    if (existingItem.quantity + 1 > product.stock) {
      return res.status(400).render('error', {
        message: 'Not enough stock available',
        error: { status: 400, stack: '' }
      });
    }
    existingItem.quantity += 1;
  } else {
    req.session.cart.push({ productId, quantity: 1 });
  }

  res.redirect('/cart');
});

app.get('/cart', requireLogin, (req, res) => {
  const cartItems = getCartDetails(req);
  const totals = cartTotals(cartItems);
  res.render('cart', { cartItems, totals });
});

app.post('/cart/remove', requireLogin, (req, res) => {
  ensureCart(req);
  const productId = parseInt(req.body.productId, 10);
  req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  res.redirect('/cart');
});

app.get('/checkout', requireLogin, (req, res) => {
  const cartItems = getCartDetails(req);
  if (cartItems.length === 0) return res.redirect('/cart');
  const totals = cartTotals(cartItems);
  res.render('checkout', {
    cartItems,
    totals,
    error: null,
    formData: {}
  });
});

app.post('/checkout', requireLogin, (req, res) => {
  const cartItems = getCartDetails(req);
  const totals = cartTotals(cartItems);

  if (cartItems.length === 0) return res.redirect('/cart');

  const {
    fname,
    lname,
    card,
    expiration,
    cvv,
    address,
    city,
    state,
    zip
  } = req.body;

  if (!fname || !lname || !card || !expiration || !cvv || !address || !city || !state || !zip) {
    return res.render('checkout', {
      cartItems,
      totals,
      error: 'All checkout fields are required.',
      formData: req.body
    });
  }

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return res.render('checkout', {
        cartItems,
        totals,
        error: `${item.name} is out of stock.`,
        formData: req.body
      });
    }
  }

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  }

  const newOrder = {
    id: orders.length ? orders[orders.length - 1].id + 1 : 1001,
    userId: req.session.userId,
    items: cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    date: new Date().toISOString().slice(0, 10),
    status: 'Placed',
    shippingAddress: `${address}, ${city}, ${state} ${zip}`,
    paymentUsed: `Card ending in ${card.slice(-4)}`
  };

  orders.push(newOrder);
  req.session.cart = [];
  res.redirect('/order-history');
});

app.get('/order-history', requireLogin, (req, res) => {
  const myOrders = orders
    .filter(o => o.userId === req.session.userId)
    .map(order => {
      const items = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product ? product.name : 'Deleted Product',
          quantity: item.quantity,
          cost: item.price
        };
      });
      return { ...order, items };
    });

  res.render('order_history', { orders: myOrders });
});

app.get('/review/:productId', requireLogin, (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const product = products.find(p => p.id === productId && p.status !== 'Deleted');

  if (!product) {
    return res.status(404).render('error', {
      message: 'Product not found',
      error: { status: 404, stack: '' }
    });
  }

  res.render('review', { product, error: null });
});

app.post('/review/:productId', requireLogin, (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const product = products.find(p => p.id === productId && p.status !== 'Deleted');

  if (!product) {
    return res.status(404).render('error', {
      message: 'Product not found',
      error: { status: 404, stack: '' }
    });
  }

  const hasPurchased = orders.some(
    o => o.userId === req.session.userId && o.items.some(i => i.productId === productId)
  );

  if (!hasPurchased) {
    return res.render('review', {
      product,
      error: 'You must purchase this product before leaving a review.'
    });
  }

  const rating = parseInt(req.body.rating || '5', 10);
  const header = req.body.review_header || 'Review';
  const body = req.body.review_body || '';

  reviews.push({
    id: reviews.length + 1,
    productId,
    userId: req.session.userId,
    rating,
    header,
    body,
    flagged: body.toLowerCase().includes('rude') || body.toLowerCase().includes('useless')
  });

  res.redirect(`/products/${productId}`);
});

app.get('/profile', requireLogin, (req, res) => {
  const user = getCurrentUser(req);
  res.render('update_profile', { user, message: null });
});

app.post('/profile/update', requireLogin, (req, res) => {
  const user = getCurrentUser(req);
  const { fname, lname, shippingAddress } = req.body;

  user.fname = fname || user.fname;
  user.lname = lname || user.lname;
  user.shippingAddress = shippingAddress || user.shippingAddress;

  res.render('update_profile', { user, message: 'Profile updated successfully.' });
});

// ------------------------
// Seller routes
// ------------------------
app.get('/seller/add-item', requireRole('seller'), (req, res) => {
  res.render('add_item', { error: null, formData: {} });
});

app.post('/seller/add-item', requireRole('seller'), (req, res) => {
  const { name, price, desc, stock } = req.body;

  if (!name || !price || !desc || !stock) {
    return res.render('add_item', {
      error: 'All product fields are required.',
      formData: req.body
    });
  }

  const duplicate = products.some(
    p =>
      p.sellerId === req.session.userId &&
      p.name.toLowerCase() === name.toLowerCase() &&
      p.status !== 'Deleted'
  );

  if (duplicate) {
    return res.render('add_item', {
      error: 'Seller must have a unique item name.',
      formData: req.body
    });
  }

  products.push({
    id: products.length + 1,
    name,
    price: parseFloat(price),
    desc,
    stock: parseInt(stock, 10),
    sellerId: req.session.userId,
    image: '/images/Carrot.png',
    status: 'Active'
  });

  res.redirect('/seller/products');
});

app.get('/seller/products', requireRole('seller'), (req, res) => {
  const sellerProducts = products.filter(
    p => p.sellerId === req.session.userId && p.status !== 'Deleted'
  );
  res.render('UC-011', { products: sellerProducts });
});

app.post('/seller/products/:id/delete', requireRole('seller'), (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId && p.sellerId === req.session.userId);

  if (!product) {
    return res.status(404).render('error', {
      message: 'Seller product not found',
      error: { status: 404, stack: '' }
    });
  }

  product.status = 'Deleted';
  res.redirect('/seller/products');
});

app.get('/seller/orders', requireRole('seller'), (req, res) => {
  const myProductIds = products
    .filter(p => p.sellerId === req.session.userId)
    .map(p => p.id);

  const sellerOrders = [];

  orders.forEach(order => {
    order.items.forEach(item => {
      if (myProductIds.includes(item.productId)) {
        const product = products.find(p => p.id === item.productId);
        const buyer = users.find(u => u.id === order.userId);
        sellerOrders.push({
          orderId: order.id,
          status: order.status,
          productName: product ? product.name : 'Deleted Product',
          customerName: buyer ? `${buyer.fname} ${buyer.lname}` : 'Unknown',
          quantity: item.quantity,
          date: order.date
        });
      }
    });
  });

  res.render('UC-012', { sellerOrders });
});

// ------------------------
// Admin routes
// ------------------------
app.get('/admin/users', requireRole('admin'), (req, res) => {
  res.render('UC-013', { users });
});

app.post('/admin/users/:id/delete', requireRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).render('error', {
      message: 'User not found',
      error: { status: 404, stack: '' }
    });
  }

  if (user.role === 'admin') {
    return res.status(400).render('error', {
      message: 'Admins cannot delete other admin accounts.',
      error: { status: 400, stack: '' }
    });
  }

  users = users.filter(u => u.id !== userId);
  orders = orders.filter(o => o.userId !== userId);
  reviews = reviews.filter(r => r.userId !== userId);

  res.redirect('/admin/users');
});

app.get('/admin/analytics', requireRole('admin'), (req, res) => {
  const totalUsers = users.length;
  const totalProducts = products.filter(p => p.status !== 'Deleted').length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0).toFixed(2);

  res.render('UC-014', {
    stats: { totalUsers, totalProducts, totalOrders, totalRevenue }
  });
});

app.get('/admin/reviews', requireRole('admin'), (req, res) => {
  const reviewData = reviews.map(r => {
    const product = products.find(p => p.id === r.productId);
    const user = users.find(u => u.id === r.userId);
    return {
      ...r,
      productName: product ? product.name : 'Deleted Product',
      userName: user ? `${user.fname} ${user.lname}` : 'Unknown User'
    };
  });

  res.render('UC-015', { reviews: reviewData });
});

app.post('/admin/reviews/:id/delete', requireRole('admin'), (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  reviews = reviews.filter(r => r.id !== reviewId);
  res.redirect('/admin/reviews');
});

// ------------------------
// Error handling
// ------------------------
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: { status: 404, stack: '' }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;