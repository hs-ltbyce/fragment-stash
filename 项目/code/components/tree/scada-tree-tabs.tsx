import { Empty, Tabs, TabsProps, TreeProps } from "antd";
import { ScadaGroupListItem } from "src/data/scada-tree-data";
import { useMemo, useRef } from "react";
import useMergedState from "rc-util/es/hooks/useMergedState";
import ScadaTree from ".";

interface ScadaTreeTabsProps {
  tabList: ScadaGroupListItem[];
  treeProps?: TreeProps;
  onChange?: TabsProps["onChange"];
  activeKey?: TabsProps["activeKey"];
}

const ScadaTreeTabs = (props: ScadaTreeTabsProps) => {
  const { activeKey: tabsActiveKey, onChange, tabList, treeProps } = props;

  if (!tabList.length) return <Empty style={{ marginTop: "50%" }} />;

  const divRef = useRef<HTMLDivElement>(null);
  const clientHeight = divRef.current?.clientHeight ?? 0;
  const treeHeight = clientHeight - 130 > 0 ? clientHeight - 130 : undefined;
  const items = useMemo(
    () =>
      tabList.map(({ id, title, children }) => ({
        key: id,
        label: title,
        children: (
          <ScadaTree
            dataSource={children}
            treeProps={{ ...treeProps, height: treeHeight }}
          />
        ),
      })),
    [tabList, treeHeight, treeProps]
  );

  const [activeKey, setActiveKey] = useMergedState<string>(tabList[0].id, {
    value: tabsActiveKey,
  });

  const onTabsChange: TabsProps["onChange"] = (activeKey) => {
    setActiveKey(activeKey);
    onChange?.(activeKey);
  };

  return (
    <div ref={divRef} style={{ height: "100%" }}>
      <Tabs activeKey={activeKey} items={items} onChange={onTabsChange} />
    </div>
  );
};

ScadaTreeTabs.displayName = "ScadaTreeTabs";

export default ScadaTreeTabs;
