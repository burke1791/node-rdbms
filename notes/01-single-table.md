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

Storing names as a Char(50) is going to waste a lot of space when we start writing data to disk. To solve this, we are going to implement variable length colums. 

In order to support variable length columns, we need to add a construct to the data record similar to the null bitmap: the variable length column offset array. It stores the number of variable length columns in the record, as well as a 4-char pointer for each column that points to the end of its data.

With the addition of variable length columns, the record structure will now follow this pattern:

- null bitmap offset: 4 chars
- fixed length columns
- null bitmap: 2 chars + 1 char per column
- variable length column offset array: 2 chars + 4 chars per column
  - first 2 chars represent the number of variable length columns
  - each 4-char pointer represents the offset from the end of the variable array to the end of its record
  - Null columns will still have the 4-char pointer. It will just point to the same spot as the previous pointer
- variable length columns

Now our new table definition will be:

```
Create Table Person (
  [PersonId] Int,
  [Age] Int,
  [Name] Varchar(50)
)
```

## Multiple Variable Length Columns

To test the variable length implementation, I am going to adjust the table DDL to include two variable length columns:

```
Create Table Person (
  [PersonId] Int,
  [Age] Int,
  [FirstName] Varchar(50),
  [LastName] Varchar(50)
)
```