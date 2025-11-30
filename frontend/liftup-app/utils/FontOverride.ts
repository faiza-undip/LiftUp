import React from "react";
import { Text, TextInput } from "react-native";

// All Text uses Quicksand by default
export default function applyGlobalFont() {
  const oldTextRender = (Text as any).render;
  const oldInputRender = (TextInput as any).render;

  if (!(Text as any).defaultProps) (Text as any).defaultProps = {};
  if (!(TextInput as any).defaultProps) (TextInput as any).defaultProps = {};

  (Text as any).defaultProps.style = [{ fontFamily: "Quicksand_400Regular" }];
  (TextInput as any).defaultProps.style = [
    { fontFamily: "Quicksand_400Regular" },
  ];

  (Text as any).render = function (...args: any[]) {
    const origin = oldTextRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: "Quicksand_400Regular" }, origin.props.style],
    });
  };

  (TextInput as any).render = function (...args: any[]) {
    const origin = oldInputRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: "Quicksand_400Regular" }, origin.props.style],
    });
  };
}
