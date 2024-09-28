import { readFileSync } from "node:fs";
import ts from "typescript";

export const parseTsConstantsModule = (sourcePath: string) => {
  const source = readFileSync(sourcePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    source,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  const flags: Record<string, boolean> = {};

  const firstStatement = sourceFile.statements[0];
  if (!ts.isVariableStatement(firstStatement)) {
    throw new Error("Expected first statement to be a variable statement");
  }

  const firstDeclaration = firstStatement.declarationList.declarations[0];

  if (
    (ts.isIdentifier(firstDeclaration.name) &&
      firstDeclaration.name.escapedText !== "BuildFlags") ||
    !firstDeclaration.initializer ||
    !ts.isObjectLiteralExpression(firstDeclaration.initializer)
  ) {
    throw new Error(
      "Expected an exported object literal flags mapping named 'BuildFlags'"
    );
  }

  firstDeclaration.initializer.properties.forEach((property) => {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      const name = property.name.escapedText as string;
      const value = ts.SyntaxKind.TrueKeyword === property.initializer.kind;
      flags[name] = value;
    }
  });

  return flags;
};
