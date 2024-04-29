import type { Plugin } from 'vue';
import { defineComponent, onMounted, provide, reactive, ref } from 'vue';
import type { RenderState, RowRange, GridConfig, GridData } from './common';
import { VerticalScrollbar } from './ver-scroll';
import { HorizionScrollbar } from './hor-scroll';
import { OperateCol } from './operate';
import { SelectCol } from './select';
import { TbHeader } from './header';
import { DataStore } from './data';
import { Renderer } from './render';

const GridComponent = defineComponent(
  <T extends GridData>(props: { config: GridConfig<T> }, { expose }) => {
    const $cav = ref<HTMLCanvasElement>();
    const store = new DataStore(props.config);
    const state = reactive<RenderState>({
      visualWidth: 0,
      visualHeight: 0,
      total: 0,
      startRow: 0,
      endRow: -1,
    });
    const renderer = new Renderer($cav, props.config, state, store);

    provide('store', store);
    provide('state', state);
    provide('renderer', renderer);

    const resize = () => {
      const $canvas = $cav.value;
      if (!$canvas) return;

      state.visualHeight = $canvas.offsetHeight;
      $canvas.height = state.visualHeight;

      renderer.render();
    };
    onMounted(() => {
      if (!$cav.value) return;
      // $cav.value.style.width = `${state.visualWidth}px`;
      // $cav.value.width = state.visualWidth;
      resize(); // initialze resize and render
    });
    // const setTotal = (total: number) => {
    //   state.total = total;
    // };
    // const fillData = (data: T[], startRow: number, endRow: number) => {
    //   store.fill(data, startRow, endRow);
    // };
    // const getSelection = () => {
    //   return store.selection;
    // };
    const getVisualRange = () => {
      return { start: state.startRow, end: state.endRow };
    };
    const getDataAt = (rowAt: number): T | null => {
      return store.getAt(rowAt) as T;
    };
    const refresh = (total: number, scrollToRowAt: number) => {
      state.total = total;
      store.clear();
      state.startRow = scrollToRowAt;
      renderer.render();
    };
    expose({
      // setTotal,
      // fillData,
      getSelection,
      getVisualRange,
      getDataAt,
      refresh,
    });
    return () => {
      return (
        <div
          style={{
            width: props.config.width ?? '100%',
            height: props.config.height ?? '100%',
          }}
          class='flex flex-col overflow-hidden border border-solid border-gray-300'
        >
          <div class='flex w-full flex-1 overflow-hidden'>
            <SelectCol config={props.config} />
            <div class='flex flex-1 flex-col overflow-hidden'>
              <TbHeader config={props.config} />
              <canvas
                style={{
                  backgroundColor: props.config.backgroundColor,
                }}
                ref={$cav}
                class='h-full flex-1 overflow-auto'
              />
            </div>
            <OperateCol config={props.config} />

            <VerticalScrollbar config={props.config.scrollbar} />
          </div>
          <HorizionScrollbar config={props.config.scrollbar} />
        </div>
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
  getVisualRange: () => RowRange;
  getDataAt: <T extends GridData>(rowAt: number) => T | null | undefined;
  /** 重置 total，清空缓存数据，然后滚动到指定行 */
  refresh: (total: number, scrollToRowAt: number) => void;
}

export type Grid = typeof GridComponent & Plugin & GridInstance;
export const Grid = GridComponent as unknown as Grid;
