/**
 * Template registry — lists all built-in framework templates
 */

const nextjs = require('./nextjs');
const express = require('./express');
const django = require('./django');
const rails = require('./rails');
const dockerCompose = require('./docker-compose');
const serverless = require('./serverless');

const TEMPLATES = {
  nextjs,
  express,
  django,
  rails,
  'docker-compose': dockerCompose,
  serverless,
};

function getTemplate(name) {
  return TEMPLATES[name] || null;
}

function listTemplates() {
  return Object.values(TEMPLATES);
}

function getTemplateNames() {
  return Object.keys(TEMPLATES);
}

module.exports = { TEMPLATES, getTemplate, listTemplates, getTemplateNames };
