const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const auth = require('../middlewares/Auth');

module.exports = app => {
  app.post('/api/stripe', auth, async (req, res) => {
    let user = await User.findOne({
      email: req.user
    });

    //stripe will charge monthly after subscription associated with stripe customer you can manage your plan or products in stripe dashboard

    // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/cards/collecting/web#create-token
    // console.log(req.body);
    let customer = {};

    //checking if stripe customer exists

    if (user.stripeId === null) {
      customer = await stripe.customers.create({
        email: req.user,
        source: req.body.id
      });
    } else {
      customer.id = user.stripeId;
    }
    // when in production we will receive a plan id with stripe token for now i am hardcoding it!
    //plan will change according to user selection
    // items: [{ plan: your_plan_id }]
    //plan id is created when you create a product using stripe dashboard

    await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: 'plan_GljsVI1z3y6I2f' }]
    });

    //just for testing!
    let nbalance = user.balance + 500;

    let user1 = await User.findOneAndUpdate(
      { email: req.user },
      { balance: nbalance, stripeId: customer.id },
      { new: true }
    );

    res.send(user1);
  });
};
