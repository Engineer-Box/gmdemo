/**
 * is-admin policy
 */

export default (policyContext, config, { strapi }) => {
  return !!policyContext.state.api_token;
};
