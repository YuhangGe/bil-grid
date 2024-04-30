import type { Plugin } from 'vue';
import { defineComponent, onMounted, ref } from 'vue';
import type { GridConfig, GridData } from './common';

import { Renderer } from './render';

const GridComponent = defineComponent(
  <T extends GridData>(props: { config: GridConfig<T> }, { expose }) => {
    const $cav = ref<HTMLCanvasElement>();

    const renderer = new Renderer($cav, props.config);

    const resize = () => {
      const $canvas = $cav.value;
      if (!$canvas) return;

      const w = $canvas.offsetWidth;
      const h = $canvas.offsetHeight;
      $canvas.height = h;
      $canvas.width = w;

      renderer.render();
    };
    onMounted(() => {
      if (!$cav.value) return;
      resize();
    });

    const setData = (data: T[], rerender = true) => {
      renderer.setData(data, rerender);
    };

    expose({
      setData,
    });
    return () => {
      return (
        <canvas
          style={{
            backgroundColor: props.config.backgroundColor,
            width: props.config.width ?? '100%',
            height: props.config.height ?? '100%',
          }}
          ref={$cav}
          class='overflow-auto'
        />
      );
    };
  },
  {
    props: ['config'],
  },
);

interface GridInstance {
  // getSelection: () => GridSelection;
  // clearData: (reRender?: boolean) => void;
  // getVisualRange: () => RowRange;
  // getDataAt: <T extends GridData>(rowAt: number) => T | null | undefined;
  // /** 重置 total，清空缓存数据，然后滚动到指定行 */
  // refresh: (total: number, scrollToRowAt: number) => void;
  setData: <T extends GridData>(data: T[], rerender?: boolean) => void;
}

export type Grid = typeof GridComponent & Plugin & GridInstance;
export const Grid = GridComponent as unknown as Grid;
