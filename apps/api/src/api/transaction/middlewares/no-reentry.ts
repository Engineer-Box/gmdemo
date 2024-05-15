// Note that once we scale up the number of servers, we will need to use redis
const enteredMap = new Map();

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const { wallet_address } = ctx.state;
    const isExecuting = enteredMap.get(wallet_address);

    if (isExecuting) {
      return ctx.conflict();
    }
    enteredMap.set(wallet_address, true);
    await next();

    enteredMap.delete(wallet_address);
  };
};
