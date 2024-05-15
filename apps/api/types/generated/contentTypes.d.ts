import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBattleBattle extends Schema.CollectionType {
  collectionName: 'battles';
  info: {
    singularName: 'battle';
    pluralName: 'battles';
    displayName: 'Battle';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    match_options: Attribute.Component<'general.match-options'> &
      Attribute.Required;
    date: Attribute.DateTime;
    match: Attribute.Relation<
      'api::battle.battle',
      'oneToOne',
      'api::match.match'
    >;
    invited_team: Attribute.Relation<
      'api::battle.battle',
      'manyToOne',
      'api::team.team'
    >;
    is_cancelled: Attribute.Boolean & Attribute.DefaultTo<false>;
    cancellation_requested_by: Attribute.Enumeration<['home', 'away']>;
    transactions: Attribute.Relation<
      'api::battle.battle',
      'oneToMany',
      'api::transaction.transaction'
    >;
    pot_amount: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::battle.battle',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::battle.battle',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDisputeDispute extends Schema.CollectionType {
  collectionName: 'disputes';
  info: {
    singularName: 'dispute';
    pluralName: 'disputes';
    displayName: 'dispute';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    match: Attribute.Relation<
      'api::dispute.dispute',
      'oneToOne',
      'api::match.match'
    >;
    resolution_summary: Attribute.RichText;
    resolved_winner: Attribute.Enumeration<['home', 'away']>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::dispute.dispute',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::dispute.dispute',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFeeTrackerFeeTracker extends Schema.SingleType {
  collectionName: 'fee_trackers';
  info: {
    singularName: 'fee-tracker';
    pluralName: 'fee-trackers';
    displayName: 'Fee Tracker';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    collected_fees: Attribute.Integer &
      Attribute.Required &
      Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::fee-tracker.fee-tracker',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::fee-tracker.fee-tracker',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGameGame extends Schema.CollectionType {
  collectionName: 'games';
  info: {
    singularName: 'game';
    pluralName: 'games';
    displayName: 'Game';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    card_image: Attribute.Media;
    cover_image: Attribute.Media;
    slug: Attribute.String & Attribute.Required & Attribute.Unique;
    teams: Attribute.Relation<'api::game.game', 'oneToMany', 'api::team.team'>;
    gamer_tags: Attribute.Relation<
      'api::game.game',
      'oneToMany',
      'api::gamer-tag.gamer-tag'
    >;
    custom_attributes: Attribute.DynamicZone<
      ['custom-attributes.pick-random', 'custom-attributes.select']
    >;
    max_team_size: Attribute.Integer &
      Attribute.Required &
      Attribute.DefaultTo<4>;
    square_image: Attribute.Media;
    rules_url: Attribute.String;
    favourited_by: Attribute.Relation<
      'api::game.game',
      'manyToMany',
      'api::profile.profile'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiGamerTagGamerTag extends Schema.CollectionType {
  collectionName: 'gamer_tags';
  info: {
    singularName: 'gamer-tag';
    pluralName: 'gamer-tags';
    displayName: 'Gamer Tag';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    game: Attribute.Relation<
      'api::gamer-tag.gamer-tag',
      'manyToOne',
      'api::game.game'
    >;
    profile: Attribute.Relation<
      'api::gamer-tag.gamer-tag',
      'manyToOne',
      'api::profile.profile'
    >;
    tag: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gamer-tag.gamer-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::gamer-tag.gamer-tag',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMatchMatch extends Schema.CollectionType {
  collectionName: 'matches';
  info: {
    singularName: 'match';
    pluralName: 'matches';
    displayName: 'Match';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    match_meta: Attribute.JSON;
    battle: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'api::battle.battle'
    >;
    home_team: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'api::team-selection.team-selection'
    >;
    away_team: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'api::team-selection.team-selection'
    >;
    result: Attribute.Enumeration<['home', 'away']>;
    home_team_vote: Attribute.Enumeration<['home', 'away']>;
    away_team_vote: Attribute.Enumeration<['home', 'away']>;
    dispute: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'api::dispute.dispute'
    >;
    last_vote_date: Attribute.DateTime;
    completed_date: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::match.match',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNotificationNotification extends Schema.CollectionType {
  collectionName: 'notifications';
  info: {
    singularName: 'notification';
    pluralName: 'notifications';
    displayName: 'Notification';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    type: Attribute.Enumeration<
      [
        'TEAM_INVITE_RECEIVED',
        'TRANSACTION_RESULT',
        'ENROLLED_IN_BATTLE',
        'BATTLE_INVITE_RECEIVED',
        'BATTLE_CONFIRMED',
        'CHALLENGE_INVITE_DECLINED',
        'DESCRIPTIVE',
        'REDIRECT'
      ]
    > &
      Attribute.Required;
    profile: Attribute.Relation<
      'api::notification.notification',
      'manyToOne',
      'api::profile.profile'
    >;
    team: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'api::team.team'
    >;
    seen: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    transaction_result_details: Attribute.JSON;
    enrolled_in_battle_details: Attribute.JSON;
    battle_invite_received_details: Attribute.JSON;
    battle_confirmed_details: Attribute.JSON;
    challenge_invite_declined_details: Attribute.JSON;
    descriptive_details: Attribute.JSON;
    redirect_details: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProfileProfile extends Schema.CollectionType {
  collectionName: 'profiles';
  info: {
    singularName: 'profile';
    pluralName: 'profiles';
    displayName: 'Profile';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    wallet_address: Attribute.String & Attribute.Required & Attribute.Unique;
    region: Attribute.Enumeration<
      ['Europe', 'North America', 'Asia', 'Oceania']
    >;
    username: Attribute.String &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    avatar: Attribute.Media;
    wager_mode: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    trust_mode: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    bio: Attribute.Text;
    team_profiles: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::team-profile.team-profile'
    >;
    notifications: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::notification.notification'
    >;
    transactions: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::transaction.transaction'
    >;
    balance: Attribute.Integer & Attribute.DefaultTo<0>;
    gamer_tags: Attribute.Relation<
      'api::profile.profile',
      'oneToMany',
      'api::gamer-tag.gamer-tag'
    >;
    social_links: Attribute.Component<'general.social-links'>;
    vouched_by: Attribute.Relation<
      'api::profile.profile',
      'manyToMany',
      'api::profile.profile'
    >;
    vouched_for: Attribute.Relation<
      'api::profile.profile',
      'manyToMany',
      'api::profile.profile'
    >;
    favourite_games: Attribute.Relation<
      'api::profile.profile',
      'manyToMany',
      'api::game.game'
    >;
    suspended: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSiteSettingsSiteSettings extends Schema.SingleType {
  collectionName: 'site_settingses';
  info: {
    singularName: 'site-settings';
    pluralName: 'site-settingses';
    displayName: 'Site Settings';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    maintenance: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::site-settings.site-settings',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::site-settings.site-settings',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTeamTeam extends Schema.CollectionType {
  collectionName: 'teams';
  info: {
    singularName: 'team';
    pluralName: 'teams';
    displayName: 'Team';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    image: Attribute.Media;
    game: Attribute.Relation<'api::team.team', 'manyToOne', 'api::game.game'>;
    name: Attribute.String & Attribute.Required;
    team_profiles: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::team-profile.team-profile'
    >;
    battle_invitations: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::battle.battle'
    >;
    team_selections: Attribute.Relation<
      'api::team.team',
      'oneToMany',
      'api::team-selection.team-selection'
    >;
    deleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::team.team', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::team.team', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiTeamProfileTeamProfile extends Schema.CollectionType {
  collectionName: 'team_profiles';
  info: {
    singularName: 'team-profile';
    pluralName: 'team-profiles';
    displayName: 'Team Profile';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    is_pending: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    role: Attribute.Enumeration<['founder', 'member', 'leader']> &
      Attribute.Required;
    profile: Attribute.Relation<
      'api::team-profile.team-profile',
      'manyToOne',
      'api::profile.profile'
    >;
    team: Attribute.Relation<
      'api::team-profile.team-profile',
      'manyToOne',
      'api::team.team'
    >;
    invited_by: Attribute.Relation<
      'api::team-profile.team-profile',
      'oneToOne',
      'api::profile.profile'
    >;
    gamer_tag: Attribute.Relation<
      'api::team-profile.team-profile',
      'oneToOne',
      'api::gamer-tag.gamer-tag'
    >;
    team_selection_profiles: Attribute.Relation<
      'api::team-profile.team-profile',
      'oneToMany',
      'api::team-selection-profile.team-selection-profile'
    >;
    deleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::team-profile.team-profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::team-profile.team-profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTeamSelectionTeamSelection extends Schema.CollectionType {
  collectionName: 'team_selections';
  info: {
    singularName: 'team-selection';
    pluralName: 'team-selections';
    displayName: 'Team Selection';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    team_selection_profiles: Attribute.Relation<
      'api::team-selection.team-selection',
      'oneToMany',
      'api::team-selection-profile.team-selection-profile'
    >;
    team: Attribute.Relation<
      'api::team-selection.team-selection',
      'manyToOne',
      'api::team.team'
    >;
    home_match: Attribute.Relation<
      'api::team-selection.team-selection',
      'oneToOne',
      'api::match.match'
    >;
    away_match: Attribute.Relation<
      'api::team-selection.team-selection',
      'oneToOne',
      'api::match.match'
    >;
    earnings: Attribute.Integer;
    xp: Attribute.Integer;
    did_win: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::team-selection.team-selection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::team-selection.team-selection',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTeamSelectionProfileTeamSelectionProfile
  extends Schema.CollectionType {
  collectionName: 'team_selection_profiles';
  info: {
    singularName: 'team-selection-profile';
    pluralName: 'team-selection-profiles';
    displayName: 'Team Selection Profile';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    is_captain: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    team_profile: Attribute.Relation<
      'api::team-selection-profile.team-selection-profile',
      'manyToOne',
      'api::team-profile.team-profile'
    >;
    team_selection: Attribute.Relation<
      'api::team-selection-profile.team-selection-profile',
      'manyToOne',
      'api::team-selection.team-selection'
    >;
    earnings: Attribute.Integer;
    xp: Attribute.Integer;
    did_win: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::team-selection-profile.team-selection-profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::team-selection-profile.team-selection-profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTransactionTransaction extends Schema.CollectionType {
  collectionName: 'transactions';
  info: {
    singularName: 'transaction';
    pluralName: 'transactions';
    displayName: 'Transaction';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    confirmed: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    type: Attribute.Enumeration<['deposit', 'withdraw', 'in', 'out']> &
      Attribute.Required;
    amount: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    profile: Attribute.Relation<
      'api::transaction.transaction',
      'manyToOne',
      'api::profile.profile'
    >;
    txHash: Attribute.String & Attribute.Private & Attribute.Unique;
    createdSinceBlockNumber: Attribute.BigInteger & Attribute.Private;
    onChainSinceBlockNumber: Attribute.BigInteger & Attribute.Private;
    battle: Attribute.Relation<
      'api::transaction.transaction',
      'manyToOne',
      'api::battle.battle'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::transaction.transaction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::transaction.transaction',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::battle.battle': ApiBattleBattle;
      'api::dispute.dispute': ApiDisputeDispute;
      'api::fee-tracker.fee-tracker': ApiFeeTrackerFeeTracker;
      'api::game.game': ApiGameGame;
      'api::gamer-tag.gamer-tag': ApiGamerTagGamerTag;
      'api::match.match': ApiMatchMatch;
      'api::notification.notification': ApiNotificationNotification;
      'api::profile.profile': ApiProfileProfile;
      'api::site-settings.site-settings': ApiSiteSettingsSiteSettings;
      'api::team.team': ApiTeamTeam;
      'api::team-profile.team-profile': ApiTeamProfileTeamProfile;
      'api::team-selection.team-selection': ApiTeamSelectionTeamSelection;
      'api::team-selection-profile.team-selection-profile': ApiTeamSelectionProfileTeamSelectionProfile;
      'api::transaction.transaction': ApiTransactionTransaction;
    }
  }
}
