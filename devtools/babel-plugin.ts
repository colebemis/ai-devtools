import { types as t } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";
import nodePath from "node:path";
import template from "@babel/template";

// Inspired by https://github.com/ui-devtools/ui-devtools/blob/main/packages/devtools/babel.js

const WRAPPER_NAME = "_ElementWrapper";

export default declare((api) => {
  api.assertVersion(7);

  // Only run in development
  if (process.env.NODE_ENV !== "development")
    return {
      name: "babel-plugin",
      visitor: {},
    };

  return {
    // TODO: Give this plugin a more descriptive name
    name: "babel-plugin",
    visitor: {
      Program(path, state) {
        // Ignore non-source files
        // TODO: Make this more robust
        if (!state.filename.includes("src")) return;

        const importPath = nodePath.relative(
          nodePath.dirname(state.filename),
          __dirname
        );

        // Create import statement
        const importDeclaration = t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier(WRAPPER_NAME),
              t.identifier("ElementWrapper")
            ),
          ],
          // TODO: Import from package instead of local file
          t.stringLiteral(importPath)
        );

        // Add import statement to the top of the file
        path.node.body.unshift(importDeclaration);

        // TODO: Check if ElementWrapper is already imported
      },
      // Wrap JSX elements in ElementWrapper
      JSXElement: {
        exit(path, state) {
          // Ignore non-source files
          // TODO: Make this more robust
          if (!state.filename.includes("src")) return;

          // Don't wrap wrapper elements
          if (isElementWrapper(path.node) || isElementWrapper(path.parent)) {
            return;
          }

          // TODO: Don't wrap React.StrictMode or React.Fragment

          const location = path.node.loc;

          // Ignore generated code
          if (!location) return;

          // TODO: Ensure uuid is unique
          const uuid = Math.random().toString(36).slice(2);

          const uuidAttr = t.jsxAttribute(
            t.jsxIdentifier("uuid"),
            t.jsxExpressionContainer(t.stringLiteral(uuid))
          );

          const filenameAttr = t.jsxAttribute(
            t.jsxIdentifier("filename"),
            t.jsxExpressionContainer(t.stringLiteral(state.filename))
          );

          const locationAttr = t.jsxAttribute(
            t.jsxIdentifier("location"),
            t.jsxExpressionContainer(
              template.expression(JSON.stringify(location))()
            )
          );

          const wrapperOpeningElement = t.jsxOpeningElement(
            t.jsxIdentifier(WRAPPER_NAME),
            [uuidAttr, filenameAttr, locationAttr]
          );

          const wrapperClosingElement = t.jsxClosingElement(
            t.jsxIdentifier(WRAPPER_NAME)
          );

          // If element is an HTML element, add a `data-uuid` attribute
          const name = path.node.openingElement.name;
          if (
            t.isJSXIdentifier(name) &&
            name.name[0] === name.name[0].toLowerCase()
          ) {
            path.node.openingElement.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier("data-uuid"),
                t.jsxExpressionContainer(t.stringLiteral(uuid))
              )
            );
          }

          path.replaceWith(
            t.jsxElement(wrapperOpeningElement, wrapperClosingElement, [
              path.node,
            ])
          );
        },
      },
    },
  };
});

function isElementWrapper(node: t.Node) {
  return (
    t.isJSXElement(node) &&
    t.isJSXIdentifier(node.openingElement.name) &&
    node.openingElement.name.name === WRAPPER_NAME
    // TODO: Check if ElementWrapper is imported from the devtools package
  );
}
