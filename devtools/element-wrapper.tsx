import { types } from "@babel/core";
import React from "react";
import { DevtoolsContext } from "./devtools-provider";

interface ElementWrapperProps {
  children: React.ReactNode;
  uuid: string;
  filename: string;
  location: types.SourceLocation;
}

export function ElementWrapper({
  children,
  uuid,
  filename,
  location,
}: ElementWrapperProps) {
  const { registerElement, unregisterElement } =
    React.useContext(DevtoolsContext);

  React.useEffect(() => {
    registerElement({
      uuid,
      filename,
      location,
    });

    return () => {
      unregisterElement(uuid);
    };
  }, [uuid, filename, location, registerElement, unregisterElement]);

  return <>{children}</>;
}
