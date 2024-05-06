"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isColumnDataType = exports.DataTypeNode = void 0;
const object_utils_js_1 = require("../util/object-utils.js");
const SIMPLE_COLUMN_DATA_TYPES = [
    'varchar',
    'char',
    'text',
    'integer',
    'int2',
    'int4',
    'int8',
    'smallint',
    'bigint',
    'boolean',
    'real',
    'double precision',
    'float4',
    'float8',
    'decimal',
    'numeric',
    'binary',
    'bytea',
    'date',
    'datetime',
    'time',
    'timetz',
    'timestamp',
    'timestamptz',
    'serial',
    'bigserial',
    'uuid',
    'json',
    'jsonb',
    'blob',
];
const COLUMN_DATA_TYPE_REGEX = [
    /^varchar\(\d+\)$/,
    /^char\(\d+\)$/,
    /^decimal\(\d+, \d+\)$/,
    /^numeric\(\d+, \d+\)$/,
    /^binary\(\d+\)$/,
    /^datetime\(\d+\)$/,
    /^time\(\d+\)$/,
    /^timez\(\d+\)$/,
    /^timestamp\(\d+\)$/,
    /^timestamptz\(\d+\)$/,
];
/**
 * @internal
 */
exports.DataTypeNode = (0, object_utils_js_1.freeze)({
    is(node) {
        return node.kind === 'DataTypeNode';
    },
    create(dataType) {
        return (0, object_utils_js_1.freeze)({
            kind: 'DataTypeNode',
            dataType,
        });
    },
});
function isColumnDataType(dataType) {
    if (SIMPLE_COLUMN_DATA_TYPES.includes(dataType)) {
        return true;
    }
    if (COLUMN_DATA_TYPE_REGEX.some((r) => r.test(dataType))) {
        return true;
    }
    return false;
}
exports.isColumnDataType = isColumnDataType;
