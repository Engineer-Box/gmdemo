import { Strapi } from "@strapi/strapi";
import { ThirdwebAuth, authenticateJWT } from "@thirdweb-dev/auth";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";

// TODO: Start saving the user in state rather than the wallet
/**
 * TODO: We don't need to use the private key here - as per TW engineering:
 * 
 * 
      Yes @Sid , there's a function exported by the auth SDK for this purpose - you should be able to use the exported authenticateJWT function and pass in a wallet, the jwt, and options like this:

      import { PrivateKeyWallet } from "@thirdweb-dev/wallets";

      // This can be any wallet from the wallets package
      const wallet = new PrivateKeyWallet("...") // wallet here doesn't matter

      await authenticateJWT({
        wallet,
        jwt: "...",
        options: {
          issuerAddress: "0x..." // the public address of the wallet/private key that signed the JWT
        }
      })
      In this case, the actual wallet you pass into the function isn't use / doesn't matter (ik that's a bit confusing here) - it just needs to be a valid wallet from our wallets package
      and the private key you use here doesn't matter either - ie it can be random
      (or you don't even have to use a private key wallet, can use any wallet from our package)
* 
* 
*/

const wallet = new PrivateKeyWallet(
  process.env.GAMERLY_SMART_CONTRACT_OWNER_PRIVATE_KEY || "",
);

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    try {
      const thirdWebToken = ctx.headers["x-custom-auth"];

      if (thirdWebToken) {
        const auth = new ThirdwebAuth(wallet, "gamerly.app");
        const { address } = await auth.authenticate(thirdWebToken);
        // TODO: make sure this is checking expiry date
        ctx.state.wallet_address = address ?? null;
      }
    } catch (error) {
      ctx.state.wallet_address = null;
    }

    const acc1 = "0x5F5E88C273260D8D3AF3dB8026551daE05838dE2";
    const acc2 = "0x1B608973A4f462537A964a8FFf43d19800490CF3";

    // ctx.state.wallet_address = acc1;

    return next();
  };
};
