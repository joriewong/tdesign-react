import React, { CSSProperties, useRef, useState, PropsWithChildren } from 'react';
import classnames from 'classnames';
import { BaseTableCol, DataType } from '../type';
import useConfig from '../../_util/useConfig';
import { useTableContext } from './TableContext';
import { isNodeOverflow } from '../../_util/dom';
import useLayoutEffect from '../../_util/useLayoutEffect';
import Popup from '../../popup';

export interface CellProps<D extends DataType> extends BaseTableCol<DataType> {
  columns?: BaseTableCol[];
  type?: 'cell' | 'title';
  record?: D;
  style?: CSSProperties;
  rowIndex?: number;
  colIndex?: number;
  rowspan?: number;
  colspan?: number;
  customRender: Function;
  isFirstChildTdSetBorderWidth?: Boolean;
}

const TableCell = <D extends DataType>(props: PropsWithChildren<CellProps<D>>) => {
  const {
    style = {},
    width,
    type,
    record,
    colKey,
    customRender,
    colIndex,
    fixed,
    align,
    ellipsis,
    columns,
    rowIndex,
    className,
    rowspan,
    colspan,
    isFirstChildTdSetBorderWidth,
  } = props;

  const { classPrefix } = useConfig();
  const { flattenColumns, flattenData, pageData } = useTableContext();
  const [offset, setOffset] = useState(0);
  const [isBoundary, setIsBoundary] = useState(false);
  const [isCellNodeOverflow, setIsCellNodeOverflow] = useState(false);

  const ref = useRef<HTMLTableDataCellElement | HTMLTableHeaderCellElement>();
  const isEllipsis = ellipsis === true || typeof ellipsis === 'function';

  useLayoutEffect(() => {
    const tdRef = ref.current;
    if (!tdRef || !isEllipsis) return;

    const isCellNodeOverflow = isNodeOverflow(tdRef);
    setIsCellNodeOverflow(isCellNodeOverflow);
  }, [ref, isEllipsis]);

  useLayoutEffect(() => {
    if (ref.current) {
      let offset = 0;
      const fixedColumns = flattenColumns.filter((column) => column.fixed === fixed);
      const indexInFixedColumns = fixedColumns.findIndex(({ colKey: key }) => key === colKey);

      if (indexInFixedColumns === -1) return;
      let indexInCols = flattenColumns.findIndex(({ colKey: key }) => key === colKey);

      //  fix issue #334
      //  这里累加的宽度应该是兄弟节点的宽度
      let currentNode: Element = ref.current;
      if (fixed === 'left') {
        while (indexInCols > 0) {
          const preEl = currentNode.previousElementSibling;
          if (flattenColumns[indexInCols - 1]?.fixed) {
            offset += preEl?.clientWidth || 0;
          }
          indexInCols -= 1;
          currentNode = preEl;
        }
      } else if (fixed === 'right') {
        while (indexInCols < flattenColumns.length) {
          const nextEl = currentNode.nextElementSibling;
          if (flattenColumns[indexInCols + 1]?.fixed) {
            offset += nextEl?.clientWidth || 0;
          }
          indexInCols += 1;
          currentNode = nextEl;
        }
      }
      setOffset(offset);

      const isBoundary = fixed === 'left' ? indexInFixedColumns === fixedColumns.length - 1 : indexInFixedColumns === 0;
      setIsBoundary(isBoundary);
    }
  }, [ref, flattenColumns, colKey, fixed]);

  // ==================== styles ====================
  const cellStyle = { ...style };
  if (fixed) {
    cellStyle.position = 'sticky';
    cellStyle[fixed] = offset;
  }
  if (width && !fixed) {
    cellStyle.overflow = 'hidden';
  }
  if (isFirstChildTdSetBorderWidth) {
    cellStyle.borderWidth = 1;
  }

  function getCellNode(className?) {
    const cellNode = customRender({
      type,
      row: record,
      rowIndex,
      col: columns?.[colIndex],
      colIndex,
      flattenData,
      pageData,
      className,
    });
    return cellNode;
  }

  function getOverflowCellNode() {
    const className = `${classPrefix}-text-ellipsis`;
    const cellNode = getCellNode(className);
    let popupCellContent;
    if (typeof ellipsis === 'function') {
      popupCellContent = ellipsis({
        row: record,
        col: columns?.[colIndex],
        rowIndex,
        colIndex,
      });
    } else {
      popupCellContent = cellNode;
    }

    return (
      <Popup
        style={{ display: 'inline' }}
        overlayStyle={{
          width: '100%',
          maxWidth: 400,
          wordBreak: 'break-all',
        }}
        placement="bottom-left"
        showArrow={false}
        content={popupCellContent}
      >
        {cellNode}
      </Popup>
    );
  }

  return (
    <td
      ref={ref}
      style={cellStyle}
      className={classnames({
        [`${classPrefix}-table__cell--fixed-${fixed}`]: fixed,
        [`${classPrefix}-table__cell--fixed-${fixed}-${fixed === 'left' ? 'last' : 'first'}`]: fixed && isBoundary,
        [`${classPrefix}-align-${align}`]: align,
        [`${classPrefix}-text-ellipsis`]: isEllipsis,
        [`${className}`]: !!className,
      })}
      rowSpan={rowspan}
      colSpan={colspan}
    >
      {!isCellNodeOverflow ? getCellNode() : getOverflowCellNode()}
    </td>
  );
};

export default TableCell;
