import type { Schema, Attribute } from '@strapi/strapi';

export interface CustomAttributesPickRandom extends Schema.Component {
  collectionName: 'components_custom_attributes_pick_randoms';
  info: {
    displayName: 'Pick Random';
    description: '';
  };
  attributes: {
    options: Attribute.Component<'general.custom-attribute-option', true> &
      Attribute.Required;
    attribute: Attribute.Component<'general.custom-attribute'> &
      Attribute.Required;
  };
}

export interface CustomAttributesSelect extends Schema.Component {
  collectionName: 'components_custom_attributes_selects';
  info: {
    displayName: 'Select';
    description: '';
  };
  attributes: {
    attribute: Attribute.Component<'general.custom-attribute'> &
      Attribute.Required;
    options: Attribute.Component<'general.custom-attribute-option', true>;
    input_type: Attribute.Enumeration<['dropdown', 'radio', 'multi-select']> &
      Attribute.Required &
      Attribute.DefaultTo<'dropdown'>;
  };
}

export interface GeneralCustomAttributeOption extends Schema.Component {
  collectionName: 'components_general_custom_attribute_options';
  info: {
    displayName: 'Custom Attribute Option';
  };
  attributes: {
    option_id: Attribute.String & Attribute.Required;
    display_name: Attribute.String & Attribute.Required;
  };
}

export interface GeneralCustomAttribute extends Schema.Component {
  collectionName: 'components_general_custom_attributes';
  info: {
    displayName: 'Custom Attribute';
    description: '';
  };
  attributes: {
    attribute_id: Attribute.String & Attribute.Required;
    display_name: Attribute.String & Attribute.Required;
  };
}

export interface GeneralDevice extends Schema.Component {
  collectionName: 'components_general_devices';
  info: {
    displayName: 'Device';
  };
  attributes: {
    device: Attribute.Enumeration<['PC', 'Console']> & Attribute.Required;
  };
}

export interface GeneralMatchOptions extends Schema.Component {
  collectionName: 'components_general_match_options';
  info: {
    displayName: 'Match Options';
    description: '';
  };
  attributes: {
    custom_attribute_inputs: Attribute.JSON;
    game: Attribute.Relation<
      'general.match-options',
      'oneToOne',
      'api::game.game'
    >;
    team_size: Attribute.Integer & Attribute.Required;
    series: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    region: Attribute.Enumeration<
      ['Europe', 'North America', 'Asia', 'Oceania']
    >;
  };
}

export interface GeneralSocialLinks extends Schema.Component {
  collectionName: 'components_general_social_links';
  info: {
    displayName: 'Social Links';
    description: '';
  };
  attributes: {
    discord: Attribute.String;
    twitter: Attribute.String;
    twitch: Attribute.String;
    youtube: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'custom-attributes.pick-random': CustomAttributesPickRandom;
      'custom-attributes.select': CustomAttributesSelect;
      'general.custom-attribute-option': GeneralCustomAttributeOption;
      'general.custom-attribute': GeneralCustomAttribute;
      'general.device': GeneralDevice;
      'general.match-options': GeneralMatchOptions;
      'general.social-links': GeneralSocialLinks;
    }
  }
}
