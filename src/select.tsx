import { watch, defineComponent, ref, reactive } from 'vue';
import type { GridConfig, GridData, RenderRowRange } from './common';
import { uid } from './util';

export const SelectCol = defineComponent(
  <T extends GridData>(props: { config: GridConfig<T> }) => {
    const { renderFn, width } = props.config.selectColumn;
    const { height, expandHeight } = props.config.row;
    const { height: headerHeight, backgroundColor: headerBg } = props.config.header;
    const bgColor = props.config.backgroundColor;

    const items = ref<
      {
        __id: string;
        __exp: boolean;
        __sel: boolean;
        id?: string;
      }[]
    >([reactive({ __id: uid(), __sel: false, __exp: false })]);
    // watch(
    //   props.renderRowRange,
    //   ({ start, end }) => {
    //     if (start < 0 || end < start) {
    //       console.error('unexpected');
    //       return;
    //     }
    //     items.value = new Array(end - start).fill(0).map((_, i) => {
    //       return start + i;
    //     });
    //   },
    //   {
    //     immediate: true,
    //   },
    // );
    return () => {
      return (
        <div
          class='flex h-full flex-shrink-0 flex-col overflow-hidden'
          style={{ width: `${width}px` }}
        >
          {items.value.map((item) => (
                <div
                  key={item.__id}
                  style={{
                    height: `${item.__exp ? expandHeight : height}px`,
                    backgroundColor: bgColor,
                  }}
                  class='flex w-full items-center justify-center'
                >
                  {renderFn(item.__sel, item.id)}
                </div>
              ))}
        </div>
      );
    };
  },
  {
    props: ['config'],
  },
);
