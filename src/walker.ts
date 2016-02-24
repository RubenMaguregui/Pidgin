import * as AST from "./ast";
import {Context} from "./context";

/**
 *
 * @author Rubén Maguregui
 */
export interface Walker {

  walkNode(node:AST.Node): any;

}

export interface ChildWalker extends Walker {

  setParentWalker(walker:Walker): void;

  getParentWalker():Walker;

}

export abstract class ChildWalkerBase implements ChildWalker {

  private parent:Walker;

  constructor(parent?:Walker) {
    this.parent = parent;
  }

  abstract walkNode(node:AST.Node);

  setParentWalker(walker:Walker):void {
    this.parent = walker;
  }

  getParentWalker():Walker {
    return this.parent;
  }

}

export class Evaluator implements Walker{

  private evaluators:Object = {
    'binaryExpression': new BinaryExpressionEvaluator(this),
    'assignmentExpression': new AssignmentExpressionEvaluator(this),
    'identifier': new IdentifierEvaluator(this),
    'functionCall': new FunctionCallEvaluator(this),
    'stringLiteral': new StringEvaluator(this),
    'numberLiteral': new NumberEvaluator(this)
  };

  private context:Context;

  constructor(context?:Context) {
    this.context = context;
  }

  walkNode(node:AST.Node):any {
    let evaluator = this.getEvaluatorForNode(node);
    if (!evaluator) {
      throw new Error(`Cannot walk node of unknown type "${node.type}"`);
    }
    return evaluator.walkNode(node);
  }

  registerEvaluator(nodeType:string, evaluator:ChildWalker): void {
    this.evaluators[nodeType] = evaluator;
    evaluator.setParentWalker(this);
  }

  getContext():Context {
    return this.context;
  }

  private getEvaluatorForNode(node:AST.Node):ChildWalker {
    return <ChildWalker>this.evaluators[node.type];
  }
}

export abstract class ChildEvaluator extends ChildWalkerBase {

  getParentEvaluator():Evaluator {
    return <Evaluator>this.getParentWalker();
  }
}

export class BinaryExpressionEvaluator extends ChildEvaluator {

  private operationEvaluators = {
    '+':  (x, y) => x + y,
    '-':  (x, y) => x - y,
    '*':  (x, y) => x * y,
    '/':  (x, y) => x / y,
    '%':  (x, y) => x % y,
    '^':  (x, y) => x ^ y,
    '||': (x, y) => x || y,
    '&&': (x, y) => x && y,
    '<':  (x, y) => x < y,
    '>':  (x, y) => x > y,
    '<=': (x, y) => x <= y,
    '>=': (x, y) => x >= y,
    '!=': (x, y) => x !== y,
    '=':  (x, y) => x === y
  };

  walkNode(node:AST.Node):any {
    let left = (<AST.BinaryExpressionNode>node).left;
    let right = (<AST.BinaryExpressionNode>node).right;
    let op = (<AST.BinaryExpressionNode>node).operator;
    let parent = this.getParentEvaluator();

    return this.operationEvaluators[op](
      parent.walkNode(left), parent.walkNode(right));
  }
}

export class AssignmentExpressionEvaluator extends ChildEvaluator{

  walkNode(node:AST.Node):any {
    let parent = this.getParentEvaluator();
    let assignment = <AST.AssignmentExpressionNode>node;
    let value = parent.walkNode(assignment.rhs);
    let name;


    if (assignment.lhs.type === 'identifier') {
      //Assignment to a global (non-qualified) identifier
      name = (<AST.IdentifierNode>assignment.lhs).name;
      parent.getContext().set(name, value);
    }
    else {
      let memberAccess = <AST.MemberAccessNode>assignment.lhs;
      let context = parent.walkNode(memberAccess.context);
      let currentNode:any = memberAccess;

      while (currentNode.type === 'memberAccess') {
        let member = currentNode.member;
        if (member.type === 'identifier'){
          name = (<AST.IdentifierNode>member).name;
        } else {
          name = parent.walkNode(member);
        }
        context = context[name];
        currentNode = currentNode.member;
      }

      name = parent.walkNode(currentNode);

      context[name] = value;
    }
  }
}

export class IdentifierEvaluator extends ChildEvaluator {

  walkNode(node:AST.Node):any {
    let identifier = <AST.IdentifierNode>node;

    return this.getParentEvaluator().getContext().get(identifier.name);
  }
}

export class FunctionCallEvaluator extends ChildEvaluator {

  walkNode(node:AST.Node):any {
    let parent = this.getParentEvaluator();
    let functionCall = <AST.FunctionCallNode>node;
    let callee = parent.walkNode(functionCall.callee);

    if (typeof callee !== 'function') {
      throw new Error('Invalid function call');
    }

    let args = [];
    functionCall.arguments.forEach((arg:AST.Node) => {
      args.push(parent.walkNode((arg)));
    });

    return callee(...args);

  }
}

export class NumberEvaluator extends ChildEvaluator {

  walkNode(node:AST.Node) {
    return (<AST.NumberNode>node).value;
  }
}

export class StringEvaluator extends ChildEvaluator {

  walkNode(node:AST.Node) {
    return (<AST.StringNode>node).value;
  }
}



