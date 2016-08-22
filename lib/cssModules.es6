import fs from 'fs';
import path from 'path';
import _get from 'lodash.get';
import parseAttrs from 'posthtml-attrs-parser';


export default (cssModulesPath) => {
    return function cssModules(tree) {
        tree.match({attrs: {'css-module': /\w+/}}, node => {
            const attrs = parseAttrs(node.attrs);
            const cssModuleName = attrs['css-module'];
            delete attrs['css-module'];

            attrs.class = attrs.class || [];
            attrs.class.push(getCssClassName(cssModulesPath, cssModuleName));
            node.attrs = attrs.compose();

            return node;
        });
    };
};


function getCssClassName(cssModulesPath, cssModuleName) {
    if (fs.lstatSync(cssModulesPath).isDirectory()) {
        let cssModulesDir = cssModulesPath;
        let cssModuleNameParts = cssModuleName.split('.');
        let cssModulesFile = cssModuleNameParts.shift();
        cssModuleName = cssModuleNameParts.join('.');
        cssModulesPath = path.join(cssModulesDir, cssModulesFile);
    }

    const cssModules = requireUncached(cssModulesPath);
    const cssClassName = _get(cssModules, cssModuleName);
    if (! cssClassName) {
        throw getError('CSS module "' + cssModuleName + '" is not found');
    } else if (typeof cssClassName !== 'string') {
        throw getError('CSS module "' + cssModuleName + '" is not a string');
    }

    return cssClassName;
}

function requireUncached(module){
    delete require.cache[require.resolve(module)];
    return require(module);
}

function getError(message) {
    const fullMessage = '[posthtml-css-modules] ' + message;
    return new Error(fullMessage);
}
