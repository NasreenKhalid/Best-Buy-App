const bcrypt = require('bcryptjs');
const { singleFieldOnlyMessage } = require('graphql/validation/rules/SingleFieldSubscriptions');
const jwt = require('jsonwebtoken')
const {randomBytes} = require('crypto')
const {promisify} = require('util')
const { transport, makeANiceEmail} = require('../mail')
const {hasPermission} = require ('../utils')
const stripe = require ('../stripe')

const Mutations = {
  async  createItem(parent, args, ctx,info){
if(!ctx.request.userId){
  throw new Error('You must be logged in to Add an Item')
}

        const item = await ctx.db.mutation.createItem({
            data: {
    // This is how we provide a relationship between user and item 
              user: {
            connect: {
        id: ctx.request.userId
        }
              },
              ...args,
            }
        }, info);
        return item;
    },
    updateItem(parent, args, ctx, info) {
      const updates = {...args};
      delete updates.id;
      return ctx.db.mutation.updateItem({
        data:updates,
        where: {
          id: args.id
        }
      }, info)
    },
async deleteItem(parent, args, ctx,info){

const where = {id: args.id};
      // first we'll find the item
const item = await ctx.db.query.item({where}, `{id title user {id}}`)
// check if user have permissions to delete
const ownsItem = item.user.id === ctx.request.userId;
const hasPermissions = ctx.request.user.permissions.some(
 permission=> ['ADMIN', 'ITEMDELETE'].includes(permission)
);

if( ! ownsItem && !hasPermissions){
  throw new Error('You dont have the permission to delete')
}
//  Delete the item
return ctx.db.mutation.deleteItem({where}, info);
    },
async signup(parent, args, ctx,info){
args.email = args.email.toLowerCase();
const password = await bcrypt.hash(args.password, 10)

// create user in db
const user = await ctx.db.mutation.createUser({
  data: {
    ...args,
    password,
    permissions: { set: ['USER']}
  }
}, info);
// create JWT Token
const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
ctx.response.cookie('token', token, {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
} );
// we return the user to browser
return user;
    },
async signin(parent, {email, password }, ctx, info){
// check if there is a valid user
const user = await ctx.db.query.user({ where: {email}})
if(!user){
  throw new Error(`No such user found for email ${email}`);
}
const valid = await bcrypt.compare(password, user.password);
if(!valid) {
  throw new Error('Invalid Password')
}
const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
ctx.response.cookie('token', token, {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
} );
return user;
},
signout(parent, args, ctx, info){
ctx.response.clearCookie('token');
return {message: 'Goodbye'}
},
async requestReset(parent, args, ctx, info){
//  check if this is a real user
const user = await ctx.db.query.user({where: {email: args.email}});

if(!user) {
  throw new Error(`No such user found for email ${args.email}`) 
}

// set rest token and expriy on that user
const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
// email them the reset token
const mailRes = await transport.sendMail({
  from: 'nas@nasreen.com',
  to: user.email,
  subject: 'Your Password Reset Token',
  html: makeANiceEmail(`Your Password Reset Token is here!
  \n\n
  <a href="${process.env
    .FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
});

return {message: 'Thanks'}
},
async resetPassword(parent, args, ctx, info){
  // check if passowrds match
if(args.password !== args.confirmPassword){
  throw new Error ('Your Passwords do not match')
}
  // check if its a legit reset token
  const [user] = await ctx.db.query.users({
    where: {
      resetToken: args.resetToken,
      resetTokenExpiry_gte: Date.now() - 3600000,
    },
  });

  // check if its expired
  if(!user){
    throw new Error('This token is either invalid or expired')
  }
  // hash new pwd
const password = await bcrypt.hash(args.password, 10)
  // save the new password
const updatedUser = await ctx.db.mutation.updateUser({
  where: {email: user.email},
  data :{
    password,
    resetToken:null,
    resetTokenExpiry: null
  },
})
  // generate JWT
const token = jwt.sign({ userId: updatedUser.id},process.env.APP_SECRET )
  // Set the JWT cookie
ctx.response.cookie('token',token, {
  httpOnly: true,
  maxAge:1000 * 60 * 60 *24 * 365
} );
  // return the new user
  return updatedUser;
},
async updatePermissions(parent,args,ctx,info) {
  if(!ctx.request.userId){
    throw new Error('You must be logged in')
  }
  const currentUser =  await ctx.db.query.user(
    {
      where: {
        id: ctx.request.userId
      }
    }, info
  );
  hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
  return ctx.db.mutation.updateUser({
    data: {
      permissions: {
        set:args.permissions
      }
    },
    where: {
      id: args.userId
    }
  }, info)
},
async addToCart(parent, args,ctx, info) {
  // make sure they are sign in
  const {userId} = ctx.request;
  if(!userId){
    throw new Error('You must be signed in to add item to cart')
  }

  // query the users current cart
  const [existingCartItem] = await ctx.db.query.cartItems({
   where : {
    user: {id: userId},
    item: {id: args.id}
   }
    
  });

  // check it the item is already there so just increment 
  if(existingCartItem){
    console.log('this item is already n cart')
    return ctx.db.mutation.updateCartItem({
      where: {id: existingCartItem.id},
      data: {quantity: existingCartItem.quantity + 1}
    }, info)
  }
// otherwise create new item
return ctx.db.mutation.createCartItem({
  data: {
    user:{
      connect: {id: userId}
    },
    item:{
      connect: {id: args.id}
    }

  }
}, info)

},
async removeFromCart(parent, args, ctx, info) {
  // 1. Find the cart item
  const cartItem = await ctx.db.query.cartItem(
    {
      where: {
        id: args.id,
      },
    },
    `{ id, user { id }}`
  );
  // 1.5 Make sure we found an item
  if (!cartItem) throw new Error('No CartItem Found!');
  // 2. Make sure they own that cart item
  if (cartItem.user.id !== ctx.request.userId) {
    throw new Error('Cheatin huhhhh');
  }
  // 3. Delete that cart item
  return ctx.db.mutation.deleteCartItem(
    {
      where: { id: args.id },
    },
    info
  );
},
async createOrder(parent, args, ctx, info) {
  // 1. Query the current user and make sure they are signed in
  const { userId } = ctx.request;
  if (!userId) throw new Error('You must be signed in to complete this order.');
  const user = await ctx.db.query.user(
    { where: { id: userId } },
    `{
    id
    name
    email
    cart {
      id
      quantity
      item { title price id description image largeImage }
    }}`
  );
  // 2. recalculate the total for the price
  const amount = user.cart.reduce(
    (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
    0
  );
  console.log(`Going to charge for a total of ${amount}`);
  // 3. Create the stripe charge (turn token into $$$)
  const charge = await stripe.charges.create({
    amount,
    currency: 'USD',
    source: args.token,
  });
  // 4. Convert the CartItems to OrderItems
  const orderItems = user.cart.map(cartItem => {
    const orderItem = {
      ...cartItem.item,
      quantity: cartItem.quantity,
      user: { connect: { id: userId } },
    };
    delete orderItem.id;
    return orderItem;
  });

  // 5. create the Order
  const order = await ctx.db.mutation.createOrder({
    data: {
      total: charge.amount,
      charge: charge.id,
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
  });
  // 6. Clean up - clear the users cart, delete cartItems
  const cartItemIds = user.cart.map(cartItem => cartItem.id);
  await ctx.db.mutation.deleteManyCartItems({
    where: {
      id_in: cartItemIds,
    },
  });
  // 7. Return the Order to the client
  return order;
},
};

module.exports = Mutations;
