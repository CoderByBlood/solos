/**
 * Copyright (c) 2015, Three Pawns, Inc. All rights reserved.
 */

'use strict';

const fs = require('fs');
const http = require('http');

/**
 * Scanner scans the directory hierarchy of a solos, also known as the resource tree,
 * looking for Method and Entity classes.
 *
 * @param {type} config The optional configuration for this scanner. The following values
 *   are configuable:
 * <ul>
 *  <li><strong>entityRegEx</strong> (optional): The regular expression used to find entity
 *    classes in the directory structure. The default value is
 *    <code>^([\w]+[-])+entity[.]js$</code>.
 *  </li>
 *  <li><strong>uriParamExpression</strong> (optional): The regular expression used to find
 *    uri parameters in the directory structure. The default value is <code>^me$</code>.
 *  </i>
 *  <li><strong>uriParamTemplate</strong> (optional): The template used to convert uri parameter
 *    folders as defined by {@link #uriParamExpression} in to express uri params. The default
 *    value is <code>{:param-id}</code>. The template <strong>must</strong> contain the expression
 *    <code>:param</code>.
 *  </li>
 * </ul>
 *
 * @returns {Scanner}
 *
 * @author Robert R Murrell
 * @constructor
 */
function Scanner(configuration) {
  const config = configuration || {};

  this.entityNameRegEx = config.httpMethodRegEx || Scanner.DEFAUL_ENTITY_NAME_REGEXP;
  this.methodNameRegEx = config.methodNameRegEx || Scanner.DEFAULT_METHOD_NAME_REGEXP;
  this.uriParamTemplate = config.uriParamTemplate || Scanner.DEFAULT_TEMPLATE;

  const entityRegEx = config.entityRegEx || Scanner.DEFAULT_ENTITY_REGEXP;
  const uriParamRegEx = config.uriParamRegEx || Scanner.DEFAULT_URI_PARAM_REGEXP;

  this.entityRegEx = new RegExp(entityRegEx);
  this.uriParamRegEx = new RegExp(uriParamRegEx);
  this.jsRegEx = new RegExp(/[.]js$/);
  this.dirRegEx = new RegExp(/^[^.]/);
  this.seneca = undefined;
  this.root = undefined;
  this.errors = [];
}


function Resource(root, path, uri, scanner, meNode) {
  this.root = root;
  this.path = path;
  this.uri = uri;
  this.scanner = scanner;
  this.meNode = meNode;
  this.lastNode = undefined;
  this.node = undefined;
}

Resource.prototype.isInMe = () => this.meNode !== undefined;


/**
 * The name of the parameter that is replaced in the URI parameter template.
 *
 * @type String
 */
Scanner.PARAM_NAME = ':param';

/**
 * Default resource path for the scanner.
 *
 * @type String
 */
Scanner.DEFAULT_PATH = './';

/**
 * Derfault URI parameter template for the scanner.
 *
 * @type String
 */
Scanner.DEFAULT_TEMPLATE = '::param';

/**
 * Default entity expression for the scanner.
 *
 * @type RegExp
 */
Scanner.DEFAULT_ENTITY_REGEXP = /^([\w]+[-])+entity[.]js$/;

/**
 *
 * @type RegExp
 */
Scanner.DEFAUL_ENTITY_NAME_REGEXP = /[-]entity[.]js$/;

/**
 *
 * @type RegExp
 */
Scanner.DEFAULT_METHOD_NAME_REGEXP = /[.]js$/;

/**
 * Default URI parameter expression for the scanner.
 *
 * @type RegExp
 */
Scanner.DEFAULT_URI_PARAM_REGEXP = /^me$/;

/**
 * Enumerates through the directory specified by <code>path</code>, recursively
 * scanning for directories and files.
 *
 * <p>Scanner enumerates through nodes in the resourse tree using the
 * file system package <code>fs</code>.</p>
 *
 * @param resourcePath The starting path for this scanner. If no path is specified it
 *  defaults to {@link #DEFAULT_PATH}.
 *
 * @fires FilesystemEnumerator#EVENT_ENTITY_FOUND  if an entity is found in the resource tree.
 * @fires FilesystemEnumerator#EVENT_PROCESS_FOUND if a process is found in the resource tree.
 */
Scanner.prototype.scan = function scan(resourcePath) {
  const THIS = this;
  const path = (resourcePath || Scanner.DEFAULT_PATH);
  const resource = new Resource(path, path, '', THIS);

  THIS.root = path;
  Scanner.recursiveScan(resource);
};

/**
 * Generates an express URI parameter from a string regular expression.
 *
 * <p>This method replaces <code>:param</code> in the template specified by
 * {@link #uriParamTemplate} with the value specifried by <code>value</code>.</p>
 *
 * @param {String} value  The name of the URI parameter.
 *
 * @returns {String} an express URI parameter
 */
Scanner.prototype.generateUriParam = function generateUriParam(value) {
  return this.uriParamTemplate.replace(Scanner.PARAM_NAME, value);
};

/**
 * Generates a shiro permission assertion statement from a node , method and
 * whether or not there was a parameterized entity.
 *
 * @param {String} node   The node that is being scanned by the scanner.
 * @param {String}method The HTTP method the node represents.
 * @param {String}isInMe If the scanner has traversed a URI parameter (typically 'me' folder).
 *
 * @return {String} if the parameter <code>isInMe</code> is <code>true</code>, then
 * <code>node:method::owner</code> is returned, otherwise <code>node:method</code> is returned.
 */
Scanner.prototype.generatePermission = function generatePermission(node, method, isInMe) {
  return isInMe ? `${node}:${method}::owner` : `${node}:${method}`;
};

/**
 * Checks to see if parameter <code>value</code> is a valid HTTP method.
 *
 * @param {String} value    The value to test.
 *
 * @returns {Boolean} True is it a method, false if not.
 */
Scanner.prototype.isMethod = function isMethod(value) {
  const method = this.getHttpMethodFromFileName(value);
  return http.METHODS.indexOf(method.toUpperCase()) > -1;
};

Scanner.prototype.isResourceFile = function isResourceFile(value) {
  return this.jsRegEx.test(value);
};

Scanner.prototype.isResourceDirectory = function isResourceDirectory(value) {
  return this.dirRegEx.test(value);
};

/**
 *
 * @param {String} value
 *
 * @returns {String}
 */
Scanner.prototype.getEntityName = function getEntityName(value) {
  return value.replace(this.entityNameRegEx, '');
};

/**
 *
 * @param {String} value
 *
 * @returns {String}
 */
Scanner.prototype.getHttpMethodFromFileName = function getHttpMethodFromFileName(value) {
  return value.replace(this.methodNameRegEx, '');
};

/**
 * Checks to see if parameter <code>value</code> passes the entity regular
 * expression.
 *
 * @param {String} value The value to test.
 *
 * @returns {Boolean} True is it matches the expression, false if not.
 */
Scanner.prototype.isEntity = function isEntity(value) {
  this.entityRegEx.lastIndex = 0;
  return this.entityRegEx.test(value);
};

/**
 * Checks to see if parameter <code>value</code> passes the URI parameter regular
 * expression.
 *
 * @param {String} value The value to test.
 *
 * @returns {Boolean} True is it matches the expression, false if not.
 */
Scanner.prototype.isParameter = function isParameter(value) {
  this.uriParamRegEx.lastIndex = 0;
  return this.uriParamRegEx.test(value);
};

Scanner.prototype.sendMessage = function sendMessage(msg) {
  const THIS = this;
  this.seneca.act(msg, (err /* , unused req parameter */) => {
    if (err) {
      THIS.errors.push(msg);
    }
  });
};

/**
 * Emits the {@link #EVENT_METHOD_FOUND} event.
 *
 * @param {String} node       The name of the node on the file system.
 * @param {String} path       The path to the node on the file system.
 * @param {String} permission The permission base on the path.
 * @param {String} uri        The express URI for the router.
 * @param {String} method     The HTTP method name
 */
Scanner.prototype.sendMethodFound = function sendMethodFound(node, path, permission, uri, method) {
  this.sendMessage({
    role: 'solos',
    cmd: 'process',
    target: 'method',
    resource: node,
    path,
    uri: uri === '' ? '/' : uri,
    method,
    permission,
  });
};

/**
 * Emits the {@link #EVENT_ENTITY_FOUND} event.
 *
 * @param {String} node The name of the node on the file syste.
 * @param {String} path The path to the node on the file system.
 * @param {String} name The name of the entity.
 */
Scanner.prototype.sendEntityFound = function sendEntityFound(node, path, name) {
  this.sendMessage({
    role: 'solos',
    cmd: 'process',
    target: 'entity',
    resource: node,
    path,
    name,
  });
};

/**
 * Emits the {@link #EVENT_UNHANDLED_RESOURCE} event.
 *
 * @param {String} node The name of the node on the file syste.
 * @param {String} path The path to the node on the file system.
 */
Scanner.prototype.sendUnhandledResource = function sendUnhandledResource(node, path) {
  this.sendMessage({
    role: 'solos',
    cmd: 'process',
    resource: node,
    path,
  });
};

/**
 * Scans the resource tree for entities and processes.
 *
 * @param {Object} resource The resource tree meta-data.
 */
Scanner.recursiveScan = function recursiveScan(resource) {
  fs.readdirSync(resource.root).forEach((node) => {
    resource.node = node;
    const path = `${resource.path}/${resource.node}`;
    const abs = fs.realpathSync(path);

    const stats = fs.statSync(path);
    if (stats.isDirectory() && resource.scanner.isResourceDirectory(resource.node)) {
      let urinode = resource.node;
      if (resource.scanner.isParameter(urinode)) {
        urinode = resource.scanner.generateUriParam(resource.lastNode);
        resource.meNode = resource.lastNode;
      }

      const next = new Resource(`${resource.root}/${resource.node}`,
        `${resource.path}/${resource.node}`,
        `${resource.uri}/${urinode}`,
        resource.scanner, resource.meNode);
      next.lastNode = resource.node;
      Scanner.recursiveScan(next);
    } else if (stats.isFile() && resource.scanner.isResourceFile(resource.node)) {
      if (resource.scanner.isMethod(resource.node)) {
        const method = resource.scanner.getHttpMethodFromFileName(resource.node);
        const inMe = resource.scanner.isParameter(resource.lastNode);
        const permission = resource.path.replace(resource.scanner.root, '').replace(/^[/]?/, '/');

        resource.scanner.sendMethodFound(
          resource.node,
          abs,
          resource.scanner.generatePermission(permission, method, inMe),
          resource.uri,
          method);
      } else if (resource.scanner.isEntity(resource.node)) {
        const entityName = resource.scanner.getEntityName(resource.node);
        resource.scanner.sendEntityFound(resource.node, abs, entityName);
      } else {
        resource.scanner.sendUnhandledResource(resource.node, abs);
      }
    }
  });
};

/*
 * Exporting the Scanner class for use in solos.
 */
module.exports = function scan(options) {
  const seneca = this;

  this.add({
    role: 'solos',
    cmd: 'scan',
  }, (msg, respond) => {
    const scanner = new Scanner(options);
    scanner.seneca = seneca;
    scanner.scan(options.resource.path);
    scanner.seneca = undefined;
    msg.scanner = scanner;
    respond(null, msg);
  });
};

module.exports.Scanner = Scanner;
