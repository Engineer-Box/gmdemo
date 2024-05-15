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

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    try {
      const apiToken =
        ctx.headers.authorization &&
        ctx.headers.authorization.split("Bearer ")[1];

      if (apiToken) {
        // TODO: also check if its coming from the admin panel
        const apiTokenService = strapi.services["admin::api-token"];
        const accessKey = await apiTokenService.hash(apiToken);
        const storedToken = await apiTokenService.getBy({
          accessKey: accessKey,
        });

        if (storedToken && storedToken.type === "full-access")
          ctx.state.api_token = "full-access";
      }
    } catch (error) {
      ctx.state.api_token = null;
    }

    return next();
  };
};
