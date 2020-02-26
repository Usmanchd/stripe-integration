const keys = require('../config/keys');
const stripe = require('stripe')(
  keys.stripeSecretKey || 'sk_test_60tgacoOmWsbWivhXeh6YDMi00TM6efiTu'
);
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require('mongoose');
const User = mongoose.model('users');
const auth = require('../middlewares/Auth');

module.exports = app => {
  app.post('/api/stripe', auth, async (req, res) => {
    const { token, plan } = req.body;
    const plans = {
      Basic: 'plan_GnzpHfj4iBD31S',
      Advanced: 'plan_GnzpzocXaGHRPO',
      Enterprise: 'plan_GnzqXioxyyaCLC'
    };
    let user = await User.findOne({
      email: req.user
    });

    console.log('user found', user);

    //stripe will charge monthly after subscription associated with stripe customer you can manage your plan or products in stripe dashboard

    // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/cards/collecting/web#create-token
    // console.log(req.body);
    let customer = {};

    //checking if stripe customer exists

    if (user.stripeId === null) {
      customer = await stripe.customers.create({
        email: req.user,
        source: token.id
      });
    } else {
      customer.id = user.stripeId;
    }

    console.log('stripe cust', customer);
    // when in production we will receive a plan id with stripe token for now i am hardcoding it!
    //plan will change according to user selection
    // items: [{ plan: your_plan_id }]
    //plan id is created when you create a product using stripe dashboard

    let sub;

    if (user.subscriptionsId !== null && user.subscription === plan.title) {
      return res.json(user);
    } else if (
      user.subscriptionsId !== null &&
      user.subscription !== plan.title &&
      user.subscription !== null
    ) {
      const subscription = await stripe.subscriptions.retrieve(
        user.subscriptionId
      );
      sub = await stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            plan: plans[plan.title]
          }
        ]
      });
    } else {
      sub = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan: plans[plan.title] }]
      });
    }

    console.log('subscription', sub);

    // //just for testing!
    // let nbalance = user.balance + 500;

    let user1 = await User.findOneAndUpdate(
      { email: req.user },
      {
        subscription: plan.title,
        subscriptionId: sub.id,
        stripeId: customer.id
      },
      { new: true }
    );

    console.log(user, 'updated and sent');

    res.send(user1);
  });

  app.get('/api/stripe/cancel', auth, async (req, res) => {
    let user = await User.findOne({
      email: req.user
    });
    console.log('cancel');
    if (user.subscriptionId === null) return res.json(user);

    await stripe.subscriptions.del(user.subscriptionId);

    let user1 = await User.findOneAndUpdate(
      { email: req.user },
      {
        subscription: null,
        subscriptionId: null
      },
      { new: true }
    );

    res.json(user1);
  });
};
