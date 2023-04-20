import { types as t } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";

// Inspired by https://github.com/ui-devtools/ui-devtools/blob/main/packages/devtools/babel.js

export default declare((api) => {
  api.assertVersion(7);
  return {
    // TODO: Give this plugin a more descriptive name
    name: "babel-plugin",
    visitor: {
      // Add `data-source` attribute to HTML elements
      JSXElement(path, state) {
        // Only run in development
        if (process.env.NODE_ENV !== "development") return;

        const location = path.node.loc;

        // Ignore generated code
        if (!location) return;

        const identifier = path.node.openingElement.name;

        // Ignore non-HTML elements
        if (
          !t.isJSXIdentifier(identifier) ||
          identifier.name[0] !== identifier.name[0].toLowerCase()
        ) {
          return;
        }

        // TODO: Ignore fragments

        const source = JSON.stringify({
          filename: state.filename,
          location,
        });

        // Add `data-source` attribute
        path.node.openingElement.attributes.push(
          t.jsxAttribute(
            // TODO: Add a prefix to avoid collisions
            t.jsxIdentifier("data-source"),
            t.jsxExpressionContainer(t.stringLiteral(source))
          )
        );
      },
    },
  };
});
