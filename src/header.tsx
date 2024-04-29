import { defineComponent, ref } from 'vue';
import type { GridConfig, GridData } from './common';
import { uid } from './util';

export const TbHeader = defineComponent(
  <T extends GridData>(props: { config: GridConfig<T> }) => {
    const { height } = props.config.header;
    const items = props.config.columns.map((column) => {
      return {
        __id: uid(),
        column: column,
        w: ref(column.width),
      };
    });

    return () => {
      return (
        <div
          class='w-full flex-shrink-0 overflow-hidden'
          style={{
            backgroundColor: props.config.header.backgroundColor,
          }}
        >
          <div class='flex'>
            {items.map((item) => (
              <div
                key={item.__id}
                style={{ width: `${item.w.value}px`, height: `${height}px` }}
                class='relative flex flex-shrink-0 items-center justify-center'
              >
                <span>{item.column.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };
  },
  {
    props: ['config'],
  },
);
