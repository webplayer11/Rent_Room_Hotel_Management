module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let isToastUsed = false;
  let isAlertUsed = false;

  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'Alert' },
      property: { name: 'alert' }
    }
  }).forEach(path => {
    const args = path.node.arguments;
    const title = args[0];
    const message = args[1];
    const buttons = args[2];

    // Check if there are complex buttons with onPress
    let hasComplexAction = false;
    let onPressFunction = null;
    if (buttons && buttons.type === 'ArrayExpression') {
      buttons.elements.forEach(el => {
        if (el.type === 'ObjectExpression') {
          const onPressProp = el.properties.find(p => p.key && p.key.name === 'onPress');
          if (onPressProp && onPressProp.value) {
            hasComplexAction = true;
            onPressFunction = onPressProp.value;
          }
        }
      });
    }

    if (hasComplexAction) {
       // If it's a confirmation, replacing it with Toast breaks the app.
       // The user said "toàn bộ" but Toast doesn't support buttons.
       // Let's replace it with a Toast and call the action immediately, or just leave it as Alert.
       // Actually, maybe we can wrap it in an Alert.alert still, but for now we skip to not break functionality.
       isAlertUsed = true;
       return;
    }

    // Determine type based on title if possible
    let typeStr = 'info';
    if (title && title.type === 'StringLiteral') {
      const t = title.value.toLowerCase();
      if (t.includes('lỗi') || t.includes('thất bại') || t.includes('thiếu')) {
        typeStr = 'error';
      } else if (t.includes('thành công') || t.includes('đã lưu') || t.includes('đã gửi')) {
        typeStr = 'success';
      }
    }

    const toastObject = j.objectExpression([
      j.property('init', j.identifier('type'), j.stringLiteral(typeStr)),
      j.property('init', j.identifier('text1'), title || j.stringLiteral('')),
      j.property('init', j.identifier('text2'), message || j.stringLiteral(''))
    ]);

    const toastCall = j.callExpression(
      j.memberExpression(j.identifier('Toast'), j.identifier('show')),
      [toastObject]
    );

    j(path).replaceWith(toastCall);
    isToastUsed = true;
  });

  if (isToastUsed) {
    // Add import Toast from 'react-native-toast-message';
    const hasToastImport = root.find(j.ImportDeclaration, {
      source: { value: 'react-native-toast-message' }
    }).size() > 0;

    if (!hasToastImport) {
      const imports = root.find(j.ImportDeclaration);
      const newImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('Toast'))],
        j.literal('react-native-toast-message')
      );
      if (imports.length > 0) {
        j(imports.at(0).get()).insertBefore(newImport);
      } else {
        root.get().node.program.body.unshift(newImport);
      }
    }

    // Attempt to remove Alert from react-native import if no longer used
    if (!isAlertUsed) {
      root.find(j.ImportDeclaration, { source: { value: 'react-native' } }).forEach(path => {
         const newSpecifiers = path.node.specifiers.filter(spec => {
             if (spec.imported && spec.imported.name === 'Alert') return false;
             return true;
         });
         path.node.specifiers = newSpecifiers;
      });
    }

    return root.toSource({ quote: 'single' });
  }

  return null;
};
