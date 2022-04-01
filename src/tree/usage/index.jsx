/**
 *  该脚本为自动生成，如有需要请在 /script/generate-usage.js 中调整
 */

// @ts-nocheck
import React from "react";
import BaseUsage, { useConfigChange } from "@site/src/components/BaseUsage";
import jsxToString from "jsx-to-string";
import configList from "./props.json";

import { Tree } from "tdesign-react";

export default function Usage() {
  const { changedProps, onConfigChange } = useConfigChange(configList);

  const defaultProps = {
    data: [
      {
        label: "第一段",
        children: [{ label: "第二段" }, { label: "第二段" }],
      },
      {
        label: "第一段",
        children: [{ label: "第二段" }, { label: "第二段" }],
      },
      {
        label: "第一段",
        children: [{ label: "第二段" }, { label: "第二段" }],
      },
    ],
  };
  const renderComp = <Tree {...defaultProps} {...changedProps} />;

  const jsxStr = jsxToString(renderComp);

  return (
    <BaseUsage
      code={jsxStr}
      configList={configList}
      onConfigChange={onConfigChange}
    >
      {renderComp}
    </BaseUsage>
  );
}
