import { Project, SyntaxKind } from 'ts-morph';
const project = new Project();
project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');
const unupgraded = [];
for (const sourceFile of project.getSourceFiles()) {
  const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  for (const obj of objectLiterals) {
    if (obj.getProperty('name') && obj.getProperty('cuisine') && !obj.getProperty('instructions')) {
       const nameProp = obj.getProperty('name');
       let nameValue = '';
       if (nameProp.getInitializer().getKind() === SyntaxKind.StringLiteral) {
         nameValue = nameProp.getInitializer().getLiteralValue();
       } else {
         nameValue = nameProp.getInitializer().getText().replace(/['"]/g, '');
       }
       unupgraded.push({ name: nameValue, file: sourceFile.getBaseName() });
    }
  }
}
console.log(JSON.stringify(unupgraded, null, 2));
