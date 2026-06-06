/**
 * envguard template - apply framework templates to generate config
 */

const fs = require("fs");
const path = require("path");
const { printHeader, colorize } = require("../utils/format");
const { findConfigFile } = require("../utils/file");
const { getTemplate, listTemplates, getTemplateNames } = require("../templates");

function runTemplateList() {
  printHeader("EnvGuard - Available Templates");
  const templates = listTemplates();
  for (const t of templates) {
    const tags = t.tags ? " (" + t.tags.join(", ") + ")" : "";
    const vars = Object.keys(t.schema).length;
    const required = Object.values(t.schema).filter(function(r) { return r.required; }).length;
    console.log("  " + colorize(t.name, "cyan") + tags);
    console.log("    " + t.description);
    console.log("    " + vars + " variables (" + required + " required)");
    console.log("");
  }
  console.log("Usage:");
  console.log("  " + colorize("envguard template apply <name>", "green"));
  console.log("  " + colorize("envguard template apply <name> --merge", "green") + "  Merge with existing config");
  console.log("");
}

function runTemplateApply(options) {
  options = options || {};
  const cwd = options.cwd || process.cwd();
  const templateName = options.template;
  if (!templateName) {
    console.error(colorize("Error: Please specify a template name.", "red"));
    console.log("Run: envguard template list");
    process.exit(1);
  }
  const tpl = getTemplate(templateName);
  if (!tpl) {
    console.error(colorize("Error: Template not found.", "red"));
    console.log("Available: " + getTemplateNames().join(", "));
    process.exit(1);
  }
  printHeader("EnvGuard - Apply Template: " + tpl.name);
  const configPath = findConfigFile(cwd);
  if (configPath && !options.merge && !options.force) {
    console.log(colorize("envguard.config.js already exists.", "yellow"));
    console.log("  Use --merge or --force");
    process.exit(1);
  }
  var finalSchema, finalSecurity, finalDocs;
  if (options.merge && configPath) {
    delete require.cache[require.resolve(path.resolve(configPath))];
    const existing = require(path.resolve(configPath));
    const es = existing.schema || existing.env || {};
    finalSchema = Object.assign({}, es, tpl.schema);
    finalSecurity = Object.assign({}, existing.security || {}, tpl.security);
    finalDocs = Object.assign({}, existing.docs || {}, tpl.docs);
    const added = Object.keys(tpl.schema).filter(function(k) { return !es[k]; });
    if (added.length) console.log(colorize("Added " + added.length + " variable(s)", "green"));
  } else {
    finalSchema = tpl.schema;
    finalSecurity = tpl.security;
    finalDocs = tpl.docs;
  }
  const out = generateConfigFile(finalSchema, finalSecurity, finalDocs, tpl.name);
  const outputPath = configPath || path.join(cwd, "envguard.config.js");
  fs.writeFileSync(outputPath, out, "utf-8");
  console.log(colorize("Config written to " + path.relative(cwd, outputPath), "green"));
  console.log("Next: envguard validate && envguard check && envguard docs");
}

function generateConfigFile(schema, security, docs, templateName) {
  const lines = [];
  lines.push("/**");
  lines.push(" * EnvGuard Configuration - " + templateName + " template");
  lines.push(" */");
  lines.push("module.exports = {");
  lines.push("  schema: {");
  for (const key of Object.keys(schema)) {
    const r = schema[key];
    if (r.description) lines.push("    // " + r.description);
    var entry = "    " + key + ": { required: " + r.required + ", type: " + JSON.stringify(r.type || "string");
    if (r.default !== undefined) entry += ", default: " + JSON.stringify(String(r.default));
    if (r.enum) entry += ", enum: " + JSON.stringify(r.enum);
    entry += " },";
    lines.push(entry);
  }
  lines.push("  },");
  lines.push("  security: { minSeverity: " + JSON.stringify(security.minSeverity || "medium") + ", ignoreKeys: [] },");
  lines.push("  docs: { projectName: " + JSON.stringify(docs.projectName || "Project") + " },");
  lines.push("};");
  return lines.join(String.fromCharCode(10));
}

function runTemplate(options) {
  options = options || {};
  if (options.subCommand === "list") runTemplateList();
  else if (options.subCommand === "apply") runTemplateApply(options);
  else runTemplateList();
}

module.exports = { runTemplate, runTemplateList, runTemplateApply, generateConfigFile };