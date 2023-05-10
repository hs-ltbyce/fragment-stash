import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";
import type { CSSProperties } from "react";
import type { ECharts } from "echarts";
import HocReactEcharts from "src/utils/hoc-react-echarts";

export interface ReactEChartsProps {
  option: any;
  style?: CSSProperties;
  loading?: boolean;
  theme?: "light" | "dark";
}

function ReactECharts({
  option,
  style,
  loading,
  theme,
}: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
      // Add chart resize listener
      new ResizeObserver(() => chart?.resize()).observe(chartRef.current);
    }

    // Return cleanup function
    return () => {
      if (chartRef.current !== null) {
        chart?.dispose();
      }
    };
  }, [theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(
        { backgroundColor: "transparent", ...option },
        { notMerge: true }
      );
    }
  }, [option, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      if (loading) {
        chart?.showLoading();
      } else {
        chart?.hideLoading();
      }
    }
  }, [loading, theme]);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100px", ...style }} />
  );
}

export const WrappedReactECharts = HocReactEcharts(ReactECharts);
