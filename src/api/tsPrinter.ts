import ts from "typescript";
import { FlagMap } from "./types";

export const printAsTs = (flags: FlagMap) => {
  const nodes = ts.factory.createNodeArray([
    ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            "BuildFlags",
            undefined,
            undefined,
            ts.factory.createObjectLiteralExpression(
              Object.keys(flags)
                .sort()
                .map((key) =>
                  ts.factory.createPropertyAssignment(
                    key,
                    flags[key].value
                      ? ts.factory.createTrue()
                      : ts.factory.createFalse()
                  )
                ),
              true
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ]);

  return print(nodes);
};

function print(nodes: ts.NodeArray<ts.Node>) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const resultFile = ts.createSourceFile(
    "temp.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX
  );

  return printer.printList(ts.ListFormat.MultiLine, nodes, resultFile);
}
