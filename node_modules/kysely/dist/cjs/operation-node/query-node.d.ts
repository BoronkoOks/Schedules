import { InsertQueryNode } from './insert-query-node.js';
import { SelectQueryNode } from './select-query-node.js';
import { UpdateQueryNode } from './update-query-node.js';
import { DeleteQueryNode } from './delete-query-node.js';
import { WhereNode } from './where-node.js';
import { JoinNode } from './join-node.js';
import { SelectionNode } from './selection-node.js';
import { ReturningNode } from './returning-node.js';
import { OperationNode } from './operation-node.js';
import { ExplainNode } from './explain-node.js';
import { ExplainFormat } from '../util/explainable.js';
import { Expression } from '../expression/expression.js';
import { MergeQueryNode } from './merge-query-node.js';
import { TopNode } from './top-node.js';
export type QueryNode = SelectQueryNode | InsertQueryNode | UpdateQueryNode | DeleteQueryNode | MergeQueryNode;
type HasJoins = {
    joins?: ReadonlyArray<JoinNode>;
};
type HasWhere = {
    where?: WhereNode;
};
type HasReturning = {
    returning?: ReturningNode;
};
type HasExplain = {
    explain?: ExplainNode;
};
type HasTop = {
    top?: TopNode;
};
/**
 * @internal
 */
export declare const QueryNode: Readonly<{
    is(node: OperationNode): node is QueryNode;
    cloneWithWhere<T extends HasWhere>(node: T, operation: OperationNode): T;
    cloneWithJoin<T_1 extends HasJoins>(node: T_1, join: JoinNode): T_1;
    cloneWithReturning<T_2 extends HasReturning>(node: T_2, selections: ReadonlyArray<SelectionNode>): T_2;
    cloneWithoutReturning<T_3 extends HasReturning>(node: T_3): T_3;
    cloneWithoutWhere<T_4 extends HasWhere>(node: T_4): T_4;
    cloneWithExplain<T_5 extends HasExplain>(node: T_5, format: ExplainFormat | undefined, options: Expression<any> | undefined): T_5;
    cloneWithTop<T_6 extends HasTop>(node: T_6, top: TopNode): T_6;
}>;
export {};
