import React from "react";
import { useEvent } from "react-use";
import "./index.css";

export function DevtoolsProvider({
  dev,
  children,
}: React.PropsWithChildren<{ dev: boolean }>) {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputPosition, setInputPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  useEvent("keydown", (event) => {
    // Skip if not in development mode
    if (!dev) return;

    switch (event.key) {
      // Toggle devtools with the ` key
      // TODO: ` might conflict with other shortcuts
      case "`":
        if (isEnabled) {
          document.querySelectorAll(`[data-dev-selected]`).forEach((el) => {
            el.removeAttribute(`data-dev-selected`);
          });
          document.querySelectorAll(`[data-dev-hover]`).forEach((el) => {
            el.removeAttribute(`data-dev-hover`);
          });
          setInputPosition(null);
          setIsEnabled(false);
        } else {
          setIsEnabled(true);
        }

        event.preventDefault();
        event.stopPropagation();
        break;

      // Disable devtools with the Escape key
      case "Escape":
        document.querySelectorAll(`[data-dev-selected]`).forEach((el) => {
          el.removeAttribute(`data-dev-selected`);
        });
        document.querySelectorAll(`[data-dev-hover]`).forEach((el) => {
          el.removeAttribute(`data-dev-hover`);
        });
        setInputPosition(null);
        setIsEnabled(false);

        event.preventDefault();
        event.stopPropagation();
        break;
    }
  });

  useEvent(
    "mouseover",
    (event) => {
      // Skip if not in development mode
      if (!dev) return;

      // Skip if devtools are not enabled
      if (!isEnabled) return;

      // Skip if the target is not an HTML element
      if (!(event.target instanceof HTMLElement)) return;

      // Skip if the target element does not have a source attribute
      if (!event.target.dataset[`devSource`]) return;

      // Remove hover attribute from all elements
      document.querySelectorAll(`[data-dev-hover]`).forEach((el) => {
        el.removeAttribute(`data-dev-hover`);
      });

      // Add hover attribute to the target element
      event.target.setAttribute(`data-dev-hover`, "");

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
      // Skip if not in development mode
      if (!dev) return;

      // Skip if devtools are not enabled
      if (!isEnabled) return;

      // Skip if the target is not an HTML element
      if (!(event.target instanceof HTMLElement)) return;

      // Get source attribute from the target element
      const source = event.target.dataset[`devSource`];

      // Skip if the target element does not have a source attribute
      if (!source) return;

      // Remove selected attribute from all elements
      document.querySelectorAll(`[data-dev-selected]`).forEach((el) => {
        el.removeAttribute(`data-dev-selected`);
      });

      // Add selected attribute to the target element
      event.target.setAttribute(`data-dev-selected`, "");

      if (inputRef.current) {
        const rect = event.target.getBoundingClientRect();

        // Set input position
        setInputPosition({
          x: rect.x,
          y: rect.y + rect.height + 8,
        });

        // Clear input value
        inputRef.current.value = "";

        // Focus input element
        inputRef.current.focus();
      }

      console.log(JSON.parse(source));

      // Prevent click event from propagating
      event.preventDefault();
      event.stopPropagation();
    },
    window,
    { capture: true }
  );

  if (!dev) return <>{children}</>;

  return (
    <div data-dev-enabled={isEnabled}>
      {children}
      <input
        ref={inputRef}
        type="text"
        data-dev-input
        data-dev-ignore
        hidden={!isEnabled || !inputPosition}
        style={{
          position: "fixed",
          left: inputPosition?.x,
          top: inputPosition?.y,
        }}
        placeholder="Type a command…"
      ></input>
    </div>
  );
}
