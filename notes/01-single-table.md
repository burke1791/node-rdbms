# Single Table Implementation

The first iteration of this ridiculous database server project is to create a DB with a single table that can insert one record at a time, or print out all existing records. Our first table will have the following DDL:

```
Create Table Person (
  [PersonId] Int,
  [Age] TinyInt,
  [Name] Char(50)
)
```

This table will be stored as a heap, no indexes, no constraints, no variable length columns, no bells and whistles whatsoever.

The server will simply be a node cli that accepts 2 commands, `insert` and `select`.