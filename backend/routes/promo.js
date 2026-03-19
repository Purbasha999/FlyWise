const express = require('express');
const router = express.Router();
const Promo = require('../models/PromoCode');

router.post('/apply', async (req, res) => {
  const { code, totalPrice, isStudent } = req.body;

  const promo = await Promo.findOne({ code, isActive: true });

  if (!promo) {
    return res.status(400).json({ success: false, message: 'Invalid code' });
  }

  if (promo.isStudentOnly && !isStudent) {
    return res.status(403).json({ success: false, message: 'Student only code' });
  }

  let discount = 0;

  if (promo.discountType === 'PERCENT') {
    discount = (promo.discountValue / 100) * totalPrice;
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = promo.discountValue;
  }

  res.json({
    success: true,
    discount,
    finalPrice: totalPrice - discount
  });
});

module.exports = router;