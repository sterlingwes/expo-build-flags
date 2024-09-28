import { declare } from "@babel/helper-plugin-utils";
import type * as BabelT from "babel__core";
import { parseTsConstantsModule } from "../api/tsParser";

export default declare((babel, options, cwd) => {
  const t = babel.types;

  if (typeof options.flagsModule !== "string") {
    throw new TypeError(
      "babel-plugin-build-flags: expected a `flagsModule` relative path string to be passed"
    );
  }

  if (!options.flagsModule.endsWith(".ts")) {
    throw new TypeError(
      "babel-plugin-build-flags: expected `flagsModule` to be a typescript module, other formats currently unsupported"
    );
  }

  const flags = parseTsConstantsModule(options.flagsModule);
  const baseModulePath = options.flagsModule
    .split("/")
    .filter((segment) => segment !== ".." && segment !== ".")
    .join("/")
    .replace(/\.ts$/, "");

  return {
    visitor: {
      VariableDeclarator: variableDeclarator,
      MemberExpression: memberExpression,
    },
  };

  function variableDeclarator(p: BabelT.NodePath, state: BabelT.PluginPass) {
    if (
      p.node.type === "VariableDeclarator" &&
      p.node.id.type === "Identifier" &&
      p.node.init &&
      p.node.init.type === "CallExpression" &&
      p.node.init.callee.type === "Identifier" &&
      p.node.init.callee.name === "require" &&
      p.node.init.arguments &&
      p.node.init.arguments.length === 1 &&
      p.node.init.arguments[0] &&
      p.node.init.arguments[0].type === "StringLiteral" &&
      p.node.init.arguments[0].value.includes(baseModulePath)
    ) {
      p.remove();
    }
  }

  function memberExpression(p: BabelT.NodePath, state: BabelT.PluginPass) {
    if (
      p.node.type === "MemberExpression" &&
      p.node.object.type === "Identifier" &&
      p.node.property.type === "Identifier" &&
      p.node.object.name === "BuildFlags" &&
      p.node.property.name in flags
    ) {
      p.replaceWith(t.booleanLiteral(flags[p.node.property.name]));
    }
  }
});
