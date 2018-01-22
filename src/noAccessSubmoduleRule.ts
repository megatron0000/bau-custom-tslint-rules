import * as ts from 'typescript'
import * as Lint from 'tslint'
import { SyntaxKind, StringLiteral } from 'typescript'

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Submodule access forbidden'

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()))
    }
}

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        let ignore = false
        let expression = node.moduleSpecifier

        if (expression.kind !== SyntaxKind.StringLiteral) {
            ignore = true
        }

        const modulePathText = (expression as StringLiteral).text

        if (!ignore && /.*\.m\/.+\.m/.test(modulePathText)) {
            this.addFailure(
                this.createFailure(
                    node.getStart(),
                    node.getWidth(),
                    Rule.FAILURE_STRING
                )
            )
        }

        // call the base version of this visitor to actually parse this node
        super.visitImportDeclaration(node)
    }
}
