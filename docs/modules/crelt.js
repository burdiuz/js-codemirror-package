async function moduleInitFunction(require,exports={}){function add(elt,child){if("string"==typeof child)elt.appendChild(document.createTextNode(child));else if(null==child);else if(null!=child.nodeType)elt.appendChild(child);else if(Array.isArray(child))for(var i=0;i<child.length;i++)add(elt,child[i]);else throw new RangeError("Unsupported child node: "+child)}return exports}