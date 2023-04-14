import { VariableSizeGrid as Grid } from "react-window";
import { EllipsisText } from "src/styles/common-style";
import styled from "styled-components/macro";

// eslint-disable-next-line import/prefer-default-export
export const GridWrapper = styled(Grid)`
  .virtual-cell {
    box-sizing: border-box;
    padding: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  }
  .virtual-cell-ellipsis {
    ${EllipsisText}
  }
  .virtual-cell-align-center {
    text-align: center;
  }
  .virtual-cell-align-left {
    text-align: left;
  }
  .virtual-cell-align-right {
    text-align: right;
  }
`;
