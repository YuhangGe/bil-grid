import type { Plugin } from 'vue';
import { defineComponent, onMounted, provide, reactive, ref } from 'vue';
import type { RenderState, RowRange, GridConfig, GridData } from './common';
import { VerticalScrollbar } from './ver-scroll';
import { HorizionScrollbar } from './hor-scroll';
import { OperateCol } from './operate';
import { SelectCol } from './select';
import { TbHeader } from './header';
import { DataStore } from './data';
import { render } from './render';

const GridComponent = defineComponent(
  <T extends GridData>(props: { config: GridConfig<T> }, { expose }) => {
    const $cav = ref<HTMLCanvasElement>();
    const store = new DataStore();
    const state = reactive<RenderState>({
      visualWidth: 0,
      visualHeight: 0,
      total: 0,
      startRow: 0,
      endRow: -1,
    });

    provide('store', store);
    provide('state', state);

    const resize = () => {
      const $canvas = $cav.value;
      if (!$canvas) return;
      state.visualHeight = $canvas.offsetHeight;
      state.visualWidth = $canvas.offsetWidth;
      $canvas.width = state.visualWidth;
      $canvas.height = state.visualHeight;
      const ctx = $canvas.getContext('2d');
      if (!ctx) return;
      render(props.config, ctx, state, store);
    };
    onMounted(() => {
      if (!$cav.value) return;
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
    const getId = (rowAt: number): T | null => {
      return store.getAt(rowAt) as T;
    };
    const refresh = (total: number, scrollToRowAt: number) => {
      state.total = total;
      store.clear();
      state.startRow = scrollToRowAt;
      const ctx = $cav.value?.getContext('2d');
      if (!ctx) return;
      render(props.config, ctx, state, store);
    };
    expose({
      // setTotal,
      // fillData,
      getSelection,
      getVisualRange,
      getId,
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
                class='w-full flex-1 overflow-hidden'
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
  getId: (rowAt: number) => string | number | null | undefined;
  /** 重置 total，清空缓存数据，然后滚动到指定行 */
  refresh: (total: number, scrollToRowAt: number) => void;
}

export type Grid = typeof GridComponent & Plugin & GridInstance;
export const Grid = GridComponent as unknown as Grid;
