# Generic Database

This page will document the process of turning the "single-table" DB into a generic DB that can support any number of tables.

## Init and Startup

### Init

When the DB is started for the first time, it will need to create a number of system objects (described below) in order to support normal DB operations. The first startup follows the following steps:

1. Create pageId 1, which contains the system `objects` table
1. Insert 3 records into the `objects` table, hard-coding the `object_id` value:
  - pages
  - objects
  - sequences
1. Create pageId 2, which contains the system `sequences` table
1. Insert 3 records into the `sequences` table, hard-coding the `sequence_id` value:
  - objects (initial `next_sequence_value` = 4)
  - pages (initial `next_sequence_value` = 3)
  - sequences (initial `next_sequence_value` = 4)
1. Insert records in the `objects` table for each of the columns in the `sequences` table, using the `next_sequence_value` of the `objects` table

## System Tables

In order for a generic DB to work, we must have a number of system tables that store metadata about the DB.

### Objects

The first such table is the objects table. It stores contains a record for every object in the DB (tables, columns, indexes, etc.), and it has the following DDL:

```
Create Table sys.objects (
  object_id Int Identity(1, 1) Not Null,
  object_type_id SmallInt Not Null,
  is_system_object Bit Not Null,
  schema_name Varchar(128) Null,
  object_name Varchar(128) Not Null,
  root_page_id Int Null,
  parent_object_id Int Null
)
```

`object_type_id`: indicates what type of object the record represents:
- 0=page
- 1=table
- 2=column
- 3=index
- 4=index key column

### Sequences

The first entry in the objects table will be the `sequences` system table. Sequences keeps track of identity values for tables with such columns. The table DDL is:

```
Create Table sys.sequences (
  [sequence_id] Int Identity(1, 1) Not Null,
  [object_id] Int Not Null,
  [next_sequence_value] BigInt Not Null,
  [sequence_increment] Int Not Null
)
```