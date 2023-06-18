import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { ColumnType } from "antd/es/table";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/lib/table/interface";

// eslint-disable-next-line import/prefer-default-export
export const getColumnSearchProps = <T extends {}>(
  dataIndex: keyof T,
  customFilter?: (text: any, record: T) => string
): Pick<ColumnType<T>, "filterDropdown" | "filterIcon" | "onFilter"> => ({
  filterDropdown: (filterDropdownProps: FilterDropdownProps) => {
    const { setSelectedKeys, selectedKeys, confirm, clearFilters } =
      filterDropdownProps;
    const handleSearch = (confirm: (param?: FilterConfirmProps) => void) => {
      confirm();
    };

    const handleReset = (
      clearFilters: () => void,
      confirm: (param?: FilterConfirmProps) => void
    ) => {
      clearFilters();
      confirm();
    };
    return (
      <div
        role="none"
        style={{ padding: 8 }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          placeholder="搜索"
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(confirm)}
          allowClear
          style={{ marginBottom: 8 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #ccc",
            padding: "7px 8px 0",
          }}
        >
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
            type="link"
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={() => handleSearch(confirm)}
            size="small"
          >
            确定
          </Button>
        </div>
      </div>
    );
  },
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record) =>
    !!(customFilter?.(record[dataIndex], record) ?? record[dataIndex])
      ?.toString()
      .toLowerCase()
      .includes((value as string).toLowerCase()),
});
