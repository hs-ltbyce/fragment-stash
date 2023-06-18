import React, { ReactNode, useEffect, useRef, useState } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { Table, Tooltip } from "antd";
import type { TableProps } from "antd";
import ResizeObserver from "rc-resize-observer";
import classNames from "classnames";
import { ColumnType } from "antd/es/table";
import { GridWrapper } from "./style";

type VirtualTableColumnType<RecordType> = Omit<
  ColumnType<RecordType>,
  "width"
> & {
  width?: number;
  renderTooltip?: (
    value: keyof RecordType,
    record: RecordType,
    rowIndex: number
  ) => ReactNode;
};

export type VirtualTableColumnsType<RecordType> =
  VirtualTableColumnType<RecordType>[];

interface VirtualTableProps<RecordType>
  extends Omit<TableProps<RecordType>, "columns"> {
  columns: VirtualTableColumnsType<RecordType>;
  scroll: {
    y: number;
  };
  rowHeight?: number;
}

const VirtualTable = <RecordType extends object>(
  props: VirtualTableProps<RecordType>
) => {
  const { columns, scroll, rowHeight = 39 } = props;
  const [tableWidth, setTableWidth] = useState(0);

  const noWidthColumnCount = columns.filter(({ width }) => !width).length;
  const totalWidth =
    columns.reduce(
      (prev: number, { width }) => (width ? prev + (width as number) : prev),
      0
    ) || 0;
  // add width in column
  const mergedColumns: VirtualTableColumnType<RecordType>[] = columns.map(
    (column) => {
      if (column.width) {
        return column;
      }

      return {
        ...column,
        width: Math.floor((tableWidth - totalWidth) / noWidthColumnCount),
      };
    }
  );

  const gridRef = useRef<Grid<unknown> | null>(null);

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (
    dataSource: readonly RecordType[],
    {
      scrollbarSize,
      onScroll,
    }: {
      scrollbarSize: number;
      ref: React.Ref<{
        scrollLeft: number;
      }>;
      onScroll: (info: {
        currentTarget?: HTMLElement;
        scrollLeft?: number;
      }) => void;
    }
  ) => {
    const totalHeight = dataSource.length * rowHeight;

    return (
      <GridWrapper
        ref={gridRef}
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const width = mergedColumns[index].width as number;
          return totalHeight > scroll.y && index === mergedColumns.length - 1
            ? width - scrollbarSize - 1
            : width;
        }}
        height={scroll.y}
        rowCount={dataSource.length}
        rowHeight={() => rowHeight}
        width={tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({
          columnIndex,
          rowIndex,
          style,
        }: {
          columnIndex: number;
          rowIndex: number;
          style: React.CSSProperties;
        }) => {
          const { render, ellipsis, align, renderTooltip } =
            mergedColumns[columnIndex];
          const rowData = dataSource[rowIndex] as {
            [key: string]: keyof RecordType;
          };
          const dataIndex = mergedColumns[columnIndex].dataIndex as string;
          const value = rowData[dataIndex];
          const text = render
            ? render(value, rowData as RecordType, rowIndex)
            : value;
          const tooltipText = renderTooltip
            ? renderTooltip(value, rowData as RecordType, rowIndex)
            : text;
          return (
            <Tooltip title={ellipsis ? (tooltipText as ReactNode) : null}>
              <div
                style={style}
                className={classNames([
                  "virtual-cell",
                  {
                    "virtual-cell-ellipsis": ellipsis,
                  },
                  {
                    "virtual-cell-align-center": align === "center",
                  },
                  {
                    "virtual-cell-align-left": align === "left",
                  },
                  {
                    "virtual-cell-align-right": align === "right",
                  },
                ])}
              >
                {text as string}
              </div>
            </Tooltip>
          );
        }}
      </GridWrapper>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        columns={mergedColumns}
        pagination={false}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
};

export default VirtualTable;
