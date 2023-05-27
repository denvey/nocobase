import { useCollectionDataSource, SchemaInitializerItemOptions } from '@nocobase/client';

import { ScheduleConfig } from './ScheduleConfig';
import { SCHEDULE_MODE } from './constants';
import { NAMESPACE, useWorkflowTranslation } from '../../locale';
import { CollectionFieldInitializers } from '../../components/CollectionFieldInitializers';
import { CollectionBlockInitializer } from '../../components/CollectionBlockInitializer';
import { useCollectionFieldOptions } from '../../variable';
import { appends } from '../../schemas/collection';
import { FieldsSelect } from '../../components/FieldsSelect';

export default {
  title: `{{t("Schedule event", { ns: "${NAMESPACE}" })}}`,
  type: 'schedule',
  fieldset: {
    config: {
      type: 'void',
      'x-component': 'ScheduleConfig',
      'x-component-props': {},
    },
    appends: {
      ...appends,
      'x-reactions': [
        {
          dependencies: ['mode', 'collection'],
          fulfill: {
            state: {
              visible: `{{$deps[0] === ${SCHEDULE_MODE.COLLECTION_FIELD} && $deps[1]}}`,
            },
          },
        },
      ],
    },
  },
  scope: {
    useCollectionDataSource,
  },
  components: {
    ScheduleConfig,
    FieldsSelect,
  },
  useVariables(config, { types }) {
    const { t } = useWorkflowTranslation();
    const options: any[] = [];
    if (!types || types.includes('date')) {
      options.push({ key: 'date', value: 'date', label: t('Trigger time') });
    }

    const fieldOptions = useCollectionFieldOptions({ collection: config.collection });
    if (config.mode === SCHEDULE_MODE.COLLECTION_FIELD) {
      if (fieldOptions.length) {
        options.push({
          key: 'data',
          value: 'data',
          label: t('Trigger data'),
          children: fieldOptions,
        });
      }
    }
    return options;
  },
  useInitializers(config): SchemaInitializerItemOptions | null {
    if (!config.collection) {
      return null;
    }

    return {
      type: 'item',
      title: `{{t("Trigger data", { ns: "${NAMESPACE}" })}}`,
      component: CollectionBlockInitializer,
      collection: config.collection,
      dataSource: '{{$context.data}}',
    };
  },
  initializers: {
    CollectionFieldInitializers,
  },
};
