import { defineComponent, onMounted, ref } from 'vue';
import { Button } from 'ant-design-vue';
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
  height: '1600px',
  backgroundColor: 'rgba(0,0,255,0.6)',
  rowHeight: 50,
  columns,
};

function mockRows(rows: number[]) {
  return rows.map((row) => {
    const d: DemoData = {
      id: `row-${row}`,
      name: `数据-${row}`,
    };
    columns.forEach((col, i) => {
      if (i === 0) return;
      d[col.key] = `列-${row}-${i}`;
    });
    return d;
  });
}

export const App = defineComponent(() => {
  const grid = ref<Grid>();
  const update = () => {
    if (!grid.value) return;
    const data = mockRows(new Array(50).fill(0).map(() => Math.floor(Math.random() * 0xff)));
    grid.value.setData(data);
  };
  onMounted(() => {
    update();
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
            变更数据
          </Button>
        </div>
        <Grid ref={grid} config={gridConfig} />
      </div>
    );
  };
});
