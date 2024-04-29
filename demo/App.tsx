import { defineComponent, onMounted, ref } from 'vue';
import { Button, Checkbox } from 'ant-design-vue';
import type { GridColumn, GridConfig } from '../src';
import { Grid } from '../src';

type DemoData = {
  id: string;
  name: string;
  [key: string]: string;
};

const columns: GridColumn<DemoData>[] = [
  {
    key: 'name',
    title: '名称',
    width: 100,
  },
  ...new Array(30).fill(0).map((_, i) => {
    return {
      key: `column-${i}`,
      title: `列-${i + 1}`,
      width: 60 + Math.floor(Math.random() * 100),
    };
  }),
];
const gridConfig: GridConfig<DemoData> = {
  height: '300px',
  scrollbar: {
    buttonLength: 60,
    buttonBreadth: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    buttonColor: 'rgba(0,0,0,0.5)',
  },
  backgroundColor: 'rgba(0,0,255,0.6)',
  header: {
    height: 40,
    backgroundColor: 'rgba(0,0,255,0.8)',
  },
  row: {
    height: 50,
    expandHeight: 120,
  },
  selectColumn: {
    width: 80,
    renderFn(selected, id) {
      return (
        <Checkbox
          checked={selected}
          onChange={(v) => {
            console.error('checked', id, v);
          }}
        />
      );
    },
  },
  operateColumn: {
    width: 100,
    renderFn(id) {
      return (
        <Button
          type='text'
          onClick={() => {
            console.error('删除', id);
          }}
        >
          删除
        </Button>
      );
    },
  },
  columns,
  onSelectionChange(sel) {
    console.error(sel);
  },
  fetchDataFn(startRow, endRow) {
    return mockApi_GetDataByRange(startRow, endRow);
  },
};

let total = 2000;

async function mockApi_GetUpdatedInfo(id: string | number) {
  console.error('find by id', id);
  total += 10;
  return {
    total,
    rowAt: Math.floor(Math.random() * total),
  };
}
async function mockApi_GetDataByRange(startRow: number, endRow: number) {
  return new Array(endRow - startRow + 1).fill(0).map((_, i) => {
    const d: DemoData = {
      id: `${startRow + i}`,
      name: `数据-${startRow + i}`,
    };
    columns.forEach((col, i) => {
      d[col.key] = `列-${i + 1}`;
    });
    return d;
  });
}

export const App = defineComponent(() => {
  const grid = ref<Grid>();
  const update = async () => {
    if (!grid.value) return;
    const vr = grid.value.getVisualRange();
    const firstId = grid.value.getId(vr.start);
    if (!firstId) {
      // 数据变更时表格第一行数据还未加载，忽略本次变更
      return;
    }
    const info = await mockApi_GetUpdatedInfo(firstId);
    grid.value.refresh(info.total, Math.max(info.rowAt, 0));
  };
  onMounted(() => {
    if (!grid.value) return;
    grid.value.refresh(total, 0);
  });

  return () => {
    return (
      <div class='flex flex-col gap-8 p-8'>
        <h1>bil-grid demo</h1>
        <div class='py-4'>
          <Button
            onClick={() => {
              void update();
            }}
          >
            数据发生变更
          </Button>
        </div>
        <Grid ref={grid} config={gridConfig} class='border border-solid border-gray-300' />
      </div>
    );
  };
});
