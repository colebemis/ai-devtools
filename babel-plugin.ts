import { declare } from "@babel/helper-plugin-utils";

export default declare((api) => {
  api.assertVersion(7);
  return {
    // TODO: Give this plugin a more descriptive name
    name: "babel-plugin",
    visitor: {
      Program(path) {
        console.log(path);
      },
    },
  };
});
