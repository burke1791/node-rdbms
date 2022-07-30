# Single Table Implementation

## First Iteration

The first iteration of this ridiculous database server project is to create a DB with a single table that can insert one record at a time, or print out all existing records. Our first table will have the following DDL:

```
Create Table Person (
  [PersonId] Int,
  [Age] Int,
  [Name] Char(50)
)
```

This table will be stored as a heap (without RIDs for now), no indexes, no constraints, no variable length columns, no bells and whistles whatsoever. And to begin, we will only store the table records in memory. We'll worry about writing to disk at a later stage.

The server will simply be a node cli that accepts 2 commands, `insert` and `select`.

## Null Bitmap

Next up, we'll add the null bitmap to the record structure. The new structure will follow this pattern:

- null bitmap offset: 4 chars
  - the number of chars from the beginning of the record to where the null bitmap resides
- fixed length columns
- null bitmap: 2 chars + 1 char per column
  - the first 2 chars represent the size of the null bitmap, e.g. if the table has three columns the first two chars in the null bitmap will be '05'.
  - each subsequent char will be 1 or 0. 1=null, 0=not null.

## Slot Array

The slot array is a construct that exists at the end of each page. It is a sequence of 4-char numbers that point to the n-th record on the page. The array is stored in reverse-order and grows from the end of the page. The slot array is entirely responsible for maintaining the physical order of records in an index (irrelevant in heaps). The actual data records can exist anywhere on the page, because the slot array maintains the actual order.

## Variable Length Columns


