import { types } from "@babel/core";
import React from "react";

interface ElementWrapperProps {
  children: React.ReactNode;
  uuid: string;
  filename: string;
  location: types.SourceLocation;
}

export function ElementWrapper({ children }: ElementWrapperProps) {
  return <>{children}</>;
}
