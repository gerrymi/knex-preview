import * as vscode from "vscode";
import Knex from "knex";
import { format } from "sql-formatter";

enum Dialects {
  MYSQL = "mysql",
  MYSQL2 = "mysql2",
  ORACLEDB = "oracledb",
  POSTGRES = "postgres",
  REDSHIFT = "redshift",
  SQLITE3 = "sqlite3",
}

function translateKnex(knexString: string, dialect: Dialects) {
  const knex = Knex({ client: dialect });
  try {
    const parsed = eval(knexString);
    const query = `${parsed.toQuery()};`;
    // const native = parsed.toSQL().toNative();
    // const nativeQuery = `${native.sql};`;

    return dialect !== "sqlite3" ? format(query) : query;
  } catch {
    return "Invalid Knex!";
  }
}

const generateTranslation = (knexPreview: any, dialect: Dialects) => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const highlighted = editor.document.getText(selection);
    const result = translateKnex(highlighted, dialect);
    knexPreview.clear();
    knexPreview.append(result);
    knexPreview.show(true);
  } else {
    vscode.window.showInformationMessage(
      "Please highlght text to translate to dialect"
    );
  }
};

export function activate(context: vscode.ExtensionContext) {
  console.log("Knex Preview is now active!");

  const knexPreview = vscode.window.createOutputChannel("knex-preview");

  const dialects = Object.values(Dialects);

  dialects.forEach((dialect) => {
    const sub = vscode.commands.registerCommand(
      `knex-preview.generate-${dialect}`,
      () => generateTranslation(knexPreview, dialect)
    );
    context.subscriptions.push(sub);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
