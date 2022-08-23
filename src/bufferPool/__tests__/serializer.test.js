import { deserializeRecord } from "../deserializer";
import { serializeRecord } from "../serializer";

describe('serializer_deserializer', () => {
  test('serializer-to-deserializer', () => {
    const values = [
      {
        name: 'object_id',
        value: '5',
        order: 1
      },
      {
        name: 'object_name',
        value: 'test_object',
        order: 5
      }
    ];
    const def = [
      {
        name: 'object_id',
        dataType: 2,
        isVariable: false,
        isNullable: false,
        isPrimaryKey: true,
        maxLength: null,
        order: 1
      },
      {
        name: 'object_name',
        dataType: 6,
        isVariable: true,
        isNullable: false,
        isPrimaryKey: false,
        maxLength: 128,
        order: 5
      }
    ];

    const serializedRecord = serializeRecord(values, def);

    expect(deserializeRecord(0, serializedRecord, def)).toStrictEqual(values);
  });
});