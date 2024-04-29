import type { GridConfig, GridData, RenderState } from './common';
import type { DataStore } from './data';

export function render(
  config: GridConfig<GridData>,
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  store: DataStore<GridData>,
) {
  const {
    columns,
    row: { height, expandHeight },
  } = config;
  const { visualHeight, visualWidth, total } = state;

  ctx.clearRect(0, 0, visualWidth, visualHeight);

  if (total === 0) {
    return;
  }
  ctx.save();
  let vh = 0;
  store.read(state.startRow, state.total - 1, (data) => {
    vh += data?.isExpand ? expandHeight : height;
    console.log('draw row:', data.rowAt);

    // if (data.data) {
    //   let i = 
    //   columns.forEach((column) => {
  
    //   })
    // }
    
    if (vh > visualHeight) {
      state.endRow = data.rowAt;
      return false;
    } else {
      return true;
    }
  });
  ctx.restore();
}
