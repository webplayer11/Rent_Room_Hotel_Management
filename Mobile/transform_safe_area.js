module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let isModified = false;

  // Find import of SafeAreaView from react-native
  const rnImports = root.find(j.ImportDeclaration, {
    source: { value: 'react-native' }
  });

  if (rnImports.length > 0) {
    rnImports.forEach(path => {
      const specifiers = path.node.specifiers;
      const safeAreaSpecifierIndex = specifiers.findIndex(
        spec => spec.type === 'ImportSpecifier' && spec.imported.name === 'SafeAreaView'
      );

      if (safeAreaSpecifierIndex !== -1) {
        // Remove SafeAreaView from react-native import
        specifiers.splice(safeAreaSpecifierIndex, 1);
        isModified = true;
      }
    });
  }

  // If SafeAreaView was imported from react-native, or if the file uses SafeAreaView but doesn't import it from context yet
  if (isModified) {
    // Check if react-native-safe-area-context import already exists
    const safeAreaImports = root.find(j.ImportDeclaration, {
      source: { value: 'react-native-safe-area-context' }
    });

    if (safeAreaImports.length > 0) {
      // Add SafeAreaView to existing import if not present
      safeAreaImports.forEach(path => {
        const hasSafeAreaView = path.node.specifiers.some(
          spec => spec.type === 'ImportSpecifier' && spec.imported.name === 'SafeAreaView'
        );
        if (!hasSafeAreaView) {
          path.node.specifiers.push(
            j.importSpecifier(j.identifier('SafeAreaView'))
          );
        }
      });
    } else {
      // Add new import for react-native-safe-area-context
      const newImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('SafeAreaView'))],
        j.literal('react-native-safe-area-context')
      );
      
      const firstImport = root.find(j.ImportDeclaration).at(0);
      if (firstImport.length > 0) {
        firstImport.insertBefore(newImport);
      } else {
        root.get().node.program.body.unshift(newImport);
      }
    }
  }

  return isModified ? root.toSource({ quote: 'single' }) : null;
};
