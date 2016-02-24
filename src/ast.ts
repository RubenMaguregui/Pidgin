/**
 *
 * @author Rubén Maguregui
 */
export interface Node {

  type:string;
}

export interface BinaryExpressionNode extends Node {

  left:Node;

  right:Node;

  operator:string;
}

export interface AssignmentExpressionNode extends Node {

  rhs:Node;

  lhs:Node;
}

export interface MemberAccessNode extends Node {

  context:Node;

  member:Node;

}

export interface IdentifierNode extends Node {

  name:string;
}

export interface FunctionCallNode extends Node {

  callee:Node;

  arguments:Node[];
}

export interface NumberNode extends Node {

  value:number;
}

export interface StringNode extends Node {

  value:string;
}