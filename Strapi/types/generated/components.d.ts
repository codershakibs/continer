import type { Schema, Struct } from '@strapi/strapi';

export interface MigrationWebflow extends Struct.ComponentSchema {
  collectionName: 'components_migration_webflows';
  info: {
    description: 'System fields carried over from the Webflow CSV export';
    displayName: 'Webflow';
    icon: 'archive';
  };
  attributes: {
    archived: Schema.Attribute.Boolean;
    collectionId: Schema.Attribute.String;
    createdOn: Schema.Attribute.DateTime;
    draft: Schema.Attribute.Boolean;
    itemId: Schema.Attribute.String;
    localeId: Schema.Attribute.String;
    publishedOn: Schema.Attribute.DateTime;
    updatedOn: Schema.Attribute.DateTime;
  };
}

export interface SharedCounter extends Struct.ComponentSchema {
  collectionName: 'components_shared_counters';
  info: {
    description: 'A headline figure with its label';
    displayName: 'Counter';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Search and social metadata';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'migration.webflow': MigrationWebflow;
      'shared.counter': SharedCounter;
      'shared.seo': SharedSeo;
    }
  }
}
