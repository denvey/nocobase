import { CollectionOptions } from '@nocobase/database';

export default {
  namespace: 'apiProxy.apiProxyProviders',
  duplicator: 'optional',
  name: 'apiProxyProviders',
  title: '{{t("OIDC Providers")}}',
  fields: [
    {
      title: '名称',
      comment: '名称',
      type: 'string',
      name: 'title',
    },
    {
      comment: 'id',
      type: 'string',
      name: 'clientId',
      unique: true,
    },
    {
      comment: '目标地址',
      type: 'string',
      name: 'host',
    },
  ],
} as CollectionOptions;
