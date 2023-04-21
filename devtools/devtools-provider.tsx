import React from "react";
import { useEvent } from "react-use";
import "./index.css";
import { types } from "@babel/core";

type ElementData = {
  uuid: string;
  filename: string;
  location: types.SourceLocation;
};

export const DevtoolsContext = React.createContext<{
  registerElement: (elementData: ElementData) => void;
  unregisterElement: (uuid: string) => void;
}>({
  registerElement: () => null,
  unregisterElement: () => null,
});

export function DevtoolsProvider({
  dev,
  children,
}: React.PropsWithChildren<{ dev: boolean }>) {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [selectedElement, setSelectedElement] =
    React.useState<HTMLElement>(null);
  const [hoveredElement, setHoveredElement] = React.useState<HTMLElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [elementMap, setElementMap] = React.useState<
    Record<string, ElementData>
  >({});

  function resetState() {
    setSelectedElement(null);
    setHoveredElement(null);
  }

  useEvent("keydown", (event) => {
    // Skip if not in development mode
    if (!dev) return;

    switch (event.key) {
      // Toggle devtools with the ` key
      // TODO: ` might conflict with other shortcuts
      case "`":
        if (isEnabled) {
          resetState();
          setIsEnabled(false);
        } else {
          setIsEnabled(true);
        }

        event.preventDefault();
        event.stopPropagation();
        break;

      // Disable devtools with the Escape key
      case "Escape":
        resetState();
        setIsEnabled(false);

        event.preventDefault();
        event.stopPropagation();
        break;
    }
  });

  useEvent(
    "mouseover",
    (event) => {
      if (!dev || !isEnabled || !(event.target instanceof HTMLElement)) return;

      // Skip if the target element does not have a uuid attribute
      if (!event.target.dataset.uuid) return;

      setHoveredElement(event.target);

      // Prevent mouseover event from propagating
      event.preventDefault();
      event.stopPropagation();
    },
    window,
    { capture: true }
  );

  useEvent(
    "click",
    (event) => {
      if (!dev || !isEnabled || !(event.target instanceof HTMLElement)) return;

      // Skip if the target element does not have a uuid attribute
      if (!event.target.dataset.uuid) return;

      setSelectedElement(event.target);

      // Focus the input
      inputRef.current.focus();

      // Prevent click event from propagating
      event.preventDefault();
      event.stopPropagation();
    },
    window,
    { capture: true }
  );

  const registerElement = React.useCallback(
    ({ uuid, filename, location }: ElementData) => {
      setElementMap((elementMap) => ({
        ...elementMap,
        [uuid]: { uuid, filename, location },
      }));
    },
    []
  );

  const unregisterElement = React.useCallback((uuid: string) => {
    setElementMap((elementMap) => {
      const { [uuid]: _, ...rest } = elementMap;
      return rest;
    });
  }, []);

  const contextValue = React.useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement]
  );

  if (!dev) return <>{children}</>;

  return (
    <DevtoolsContext.Provider value={contextValue}>
      <div data-devtools-enabled={isEnabled}>
        {children}
        {isEnabled ? (
          // TODO: Prevent page styles from affecting devtools
          <>
            <ElementOutline element={selectedElement} color="red" />
            {hoveredElement !== selectedElement ? (
              <ElementOutline element={hoveredElement} color="blue" />
            ) : null}
            <div
              style={{
                position: "fixed",
                left: 16,
                bottom: 16,
              }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!selectedElement) return;

                  const formElement = event.currentTarget;
                  const formData = new FormData(formElement);
                  const command = formData.get("command") as string;
                  const { filename, location } =
                    elementMap[selectedElement.dataset.uuid];

                  // TODO: Send request to server
                  console.log({ command, filename, location });

                  // Reset form
                  formElement.reset();
                }}
              >
                <input
                  ref={inputRef}
                  aria-label="Command"
                  name="command"
                  type="text"
                  placeholder="Type a command…"
                />
              </form>
            </div>
          </>
        ) : null}
      </div>
    </DevtoolsContext.Provider>
  );
}

function ElementOutline({
  element,
  color,
}: {
  element: HTMLElement;
  color: string;
}) {
  const [outline, setOutline] = React.useState<DOMRect>(null);

  React.useEffect(() => {
    if (!element) return;

    function handleChange() {
      setOutline(element.getBoundingClientRect());
    }

    setOutline(element.getBoundingClientRect());
    window.addEventListener("resize", handleChange);
    window.addEventListener("scroll", handleChange);

    return () => {
      window.removeEventListener("resize", handleChange);
      window.removeEventListener("scroll", handleChange);
    };
  }, [element]);

  if (!outline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: outline.top,
        left: outline.left,
        width: outline.width,
        height: outline.height,
        outline: `2px solid ${color}`,
        outlineOffset: -2,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          left: 0,
          fontSize: 12,
          lineHeight: "18px",
          fontFamily: "Menlo, monospace",
          backgroundColor: color,
          color: "white",
          padding: "0 4px",
        }}
      >
        {element.tagName.toLowerCase()}
      </div>
    </div>
  );
}
