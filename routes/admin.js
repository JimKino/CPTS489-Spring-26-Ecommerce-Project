var express = require('express');
var router = express.Router();
var { DatabaseSync } = require('node:sqlite');

// View all users
router.get('/users', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'admin') {
    return res.status(403).send('Forbidden - Admin access only');
  }
  
  const db = new DatabaseSync('./storedb.sqlite');
  const users = db.prepare('SELECT * FROM accounts').all();
  db.close();
  
  res.render('UC-013', { users });
});

// Delete user
router.post('/users/:email/delete', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'admin') {
    return res.status(403).send('Forbidden - Admin access only');
  }
  
  const userEmail = req.params.email;
  const db = new DatabaseSync('./storedb.sqlite');
  
  // Check if user exists
  const targetUser = db.prepare('SELECT * FROM accounts WHERE actEmail = ?').get(userEmail);
  
  if (!targetUser) {
    db.close();
    return res.status(404).render('error', {
      message: 'User not found',
      error: { status: 404, stack: '' }
    });
  }
  
  // Prevent deleting admin accounts
  if (targetUser.actType === 'admin') {
    db.close();
    return res.status(400).render('error', {
      message: 'Admins cannot delete other admin accounts.',
      error: { status: 400, stack: '' }
    });
  }
  
  // Delete related records first (in order to respect foreign keys)
  // 1. Delete reviews by this user
  db.prepare('DELETE FROM reviews WHERE revAct = ?').run(userEmail);
  
  // 2. Delete orders by this user
  db.prepare('DELETE FROM orders WHERE orderAct = ?').run(userEmail);
  
  // 3. Delete orders for listings by this seller
  db.prepare(`DELETE FROM orders WHERE orderList IN 
    (SELECT listNo FROM listings WHERE listSeller = ?)`).run(userEmail);
  
  // 4. Delete reviews for listings by this seller
  db.prepare(`DELETE FROM reviews WHERE revList IN 
    (SELECT listNo FROM listings WHERE listSeller = ?)`).run(userEmail);
  
  // 5. Delete listings by this seller
  db.prepare('DELETE FROM listings WHERE listSeller = ?').run(userEmail);
  
  // 6. Finally, delete the user
  db.prepare('DELETE FROM accounts WHERE actEmail = ?').run(userEmail);
  
  db.close();
  res.redirect('/admin/users');
});

// Analytics
router.get('/analytics', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'admin') {
    return res.status(403).send('Forbidden - Admin access only');
  }
  
  const db = new DatabaseSync('./storedb.sqlite');
  
  // Total users
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM accounts').get().count;
  
  // Total products (all listings)
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
  
  // Total orders
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  
  // Total revenue (sum of orderQuantity * listPrice)
  const revenueResult = db.prepare(`
    SELECT SUM(o.orderQuantity * l.listPrice) as revenue
    FROM orders o
    JOIN listings l ON o.orderList = l.listNo
  `).get();
  
  const totalRevenue = (revenueResult.revenue || 0).toFixed(2);
  
  // Simple bar chart data: count orders by seller
  const topSellers = db.prepare(`
    SELECT 
      a.actFname || ' ' || a.actLname as sellerName,
      COUNT(*) as orderCount
    FROM orders o
    JOIN listings l ON o.orderList = l.listNo
    JOIN accounts a ON l.listSeller = a.actEmail
    GROUP BY l.listSeller
    ORDER BY orderCount DESC
    LIMIT 7
  `).all();
  
  // Find max for scaling
  const maxOrders = topSellers.length > 0 ? Math.max(...topSellers.map(s => s.orderCount)) : 1;
  
  db.close();
  
  res.render('UC-014', {
    stats: { totalUsers, totalProducts, totalOrders, totalRevenue },
    topSellers,
    maxOrders
  });
});

// View all reviews
router.get('/reviews', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'admin') {
    return res.status(403).send('Forbidden - Admin access only');
  }
  
  const db = new DatabaseSync('./storedb.sqlite');
  
  // Get reviews with product and user info
  const reviewData = db.prepare(`
    SELECT 
      r.rowid as id,
      r.revRating as rating,
      r.revTitle as title,
      r.revDesc as desc,
      l.listName as productName,
      a.actFname || ' ' || a.actLname as userName
    FROM reviews r
    LEFT JOIN listings l ON r.revList = l.listNo
    LEFT JOIN accounts a ON r.revAct = a.actEmail
  `).all();
  
  db.close();
  
  res.render('UC-015', { reviews: reviewData });
});

// Delete review
router.post('/reviews/:id/delete', function(req, res) {
  const user = req.cookies.user;
  
  if (!user || !user.email || user.type !== 'admin') {
    return res.status(403).send('Forbidden - Admin access only');
  }
  
  const reviewId = parseInt(req.params.id, 10);
  const db = new DatabaseSync('./storedb.sqlite');
  
  // Delete review by rowid
  db.prepare('DELETE FROM reviews WHERE rowid = ?').run(reviewId);
  
  db.close();
  res.redirect('/admin/reviews');
});

module.exports = router;