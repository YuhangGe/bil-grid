import { defineComponent } from 'vue';
import type { GridConfig, GridData } from './common';

export const VerticalScrollbar = defineComponent(
  <T extends GridData>({ config }: { config: GridConfig<T>['scrollbar'] }) => {
    return () => {
      return (
        <div
          class='relative flex h-full flex-shrink-0 flex-col'
          style={{ width: `${config.buttonBreadth}px`, backgroundColor: config.backgroundColor }}
        >
          <div
            class='w-full'
            style={{ height: `${config.buttonLength}px`, background: config.buttonColor }}
          ></div>
        </div>
      );
    };
  },
  {
    props: ['config'],
  },
);
