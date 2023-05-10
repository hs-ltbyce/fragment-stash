import React from "react";
import { useSelector } from "react-redux";
import { useThemeSlice } from "src/app/store/theme";
import { selectTheme } from "src/app/store/theme/selector";

const HocReactEcharts = <P extends {}>(
  WrappedComponent: React.ComponentType<P>
) =>
  function component(props: P) {
    useThemeSlice();
    const theme = useSelector(selectTheme);
    return <WrappedComponent {...props} theme={theme} />;
  };

export default HocReactEcharts;
