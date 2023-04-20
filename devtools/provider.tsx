import React from "react";
import { useEvent } from "react-use";
import "./index.css";

export function DevtoolsProvider({
  dev,
  children,
}: React.PropsWithChildren<{ dev: boolean }>) {
  const [isEnabled, setIsEnabled] = React.useState(false);

  useEvent("keydown", (event) => {
    // Skip if not in development mode
    if (!dev) return;

    switch (event.key) {
      // Toggle devtools with the ` key
      // TODO: ` might conflict with other shortcuts
      case "`":
        setIsEnabled((prev) => !prev);

        event.preventDefault();
        event.stopPropagation();
        break;

      // Clear selected and hover attributes and disable devtools with the Escape key
      case "Escape":
        document.querySelectorAll(`[data-dev-selected]`).forEach((el) => {
          el.removeAttribute(`data-dev-selected`);
        });
        document.querySelectorAll(`[data-dev-hover]`).forEach((el) => {
          el.removeAttribute(`data-dev-hover`);
        });
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

      console.log(JSON.parse(source));

      // Prevent click event from propagating
      event.preventDefault();
      event.stopPropagation();
    },
    window,
    { capture: true }
  );

  if (!dev) return <>{children}</>;

  return <div data-dev-enabled={isEnabled}>{children}</div>;
}
