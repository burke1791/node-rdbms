
In this demo project, I am going to store the data "bits" as cleartext in the files. Whereas in RDBMS engines, the record, extent, etc. internal structures use fixed 1s and 0s to tell the engine what's going on, I will use fixed character lengths.

# Database file

The database file consists of one or more pages, which have a minimum size of 512 chars and increasing by powers of 2. All pages in the file are the same size.

## Database Header

The DB header exists only on the first page in the database file and contains the following information:
  - Header size (4 chars) - number of characters the DB header takes up, including the header size chunk
  - Page size (2 chars) - represented as the exponent in a power of 2 calculation. Min: 09 | Max: 13

## Page Types

There are two page types in a database file:
  - Data page (leaf level of a clustered index)
  - Index page (leaf level of a nonclustered index and non-leaf levels of all other index types)

The very first page of a database file is the root page of the system `objects` table. The objects table has the following DDL:

```
Create Table objects (
  object_id Int Identity(1, 1) Not Null,
  object_type SmallInt Not Null,
  column_order SmallInt Null,
  is_system_object Bit Not Null,
  name Varchar(128) Not Null,
  root_page_id Int Not Null,
  parent_object_id Int Null,
  ddl_text Varchar(Max) Null -- since I'm not allowing forwarding records or off-row data in this implementation, the "Max" refers to the result of PAGE_FREE_SPACE - (size of the other columns in the table)
)
```

Everything in the database is an object, and will have a corresponding record in this table.

# Metadata
Where do we store table DDL and table/column names, or column metadata? Indexes? Data pages

For the first pass, we're going to pre-populate the DB with a single table with three columns:
  - Table name: Student
    - StudentId: Int (Identity | PK | Clustered Index)
    - Age: Int
    - StudentName: Varchar(100)

We will need some system tables to store all of this metadata:
  - objects: contains tables, columns, indexes, etc. (DOES NOT store columns of system tables)
  - sequences: stores sequences used for identity columns

## System Table Column Definitions
```
objects: (see above)

Create Table sequences (
  object_id Int Not Null Primary Key Clustered,
  next_sequence_value BigInt Not Null
)
```

## Object Types (the object_type column)
  - 0=table
  - 1=column

## Data Types
  - 0=TinyInt (1 char)
  - 1=SmallInt (2 chars)
  - 2=Int (4 chars)
  - 3=BigInt (8 chars)
  - 4=Bit (1 char)
  - 5=Char (up to 8000 chars)
  - 6=Varchar (up to 8000 chars)
    - 4 char overhead

# Records
## Record Types
### Data Record
  - ~~Tag=0~~
  - Clustered indexes are stored as B-trees
  - Heaps are unordered (no B-tree)
  - If a clustered index is non-unique, the engine will contain a hidden 'uniquifier' column

### Data Record Structure
  - ~~Tag Bytes ( 1 char )~~
  - Null Bitmap Offset (4 chars) - offset from the beginning of the record
  - Fixed Length Columns
  - Null Bitmap (2 chars + 1 char per column)
    - first 2 chars represent the size of the null bitmap (max value is 99 so we effectively limit the number of columns per table to 97)
    - the remaining chars are 1 or 0 indicating whether or not the column is null (1=null, 0=not null)
  - Variable Length Column Offset Array
    - (2 chars) number of variable Columns
    - (4 chars) for each variable length column, it contains the offset (count of characters)
      from the end of the offset array to the end of its column
  - Variable Length Columns

### Index Records
  - ~~Tag=1~~
  - Two types: leaf and non-leaf
  - Leaf records only occur in nonclustered indexes
  - Non-leaf records occur in all index types in levels above the leaf level

## Index Record Structure
  - ~~tag: 1 char~~
  - childPageId: 4 chars
  - index key(s) of the first record on the childPageId

# Pages
## Data Page
  - Store data records
  - Leaf-level of a clustered index

## Index Page
  - Index records
  - Leaf-level of non-clustered indexes, and non-leaf levels of all other index types


## Page Structure (This)
  - Header: 33 chars
    - fileId: 2 chars
    - pageId: 4 chars
    - pageType: 1 char
      - 1=data
      - 2=index
    - pageLevel: 2 chars; effectively limits the size of our indexes, but w/e
      - data page is always = 00
      - indicates the level in the B-tree the page is
    - prevPageId: 4 chars | the pageId of the previous page at this level of the B-tree
    - nextPageId: 4 chars | the pageId of the next page at this level of the B-tree
    - recordCount: 4 chars | num records on the page
    - freeCount: 4 chars | num chars available on the page (less the reservedCount)
    - reservedCount: 4 chars | num chars reserved by active transactions
    - firstFreeData: 4 chars | offset from the start of the page to the first char after the end of the last record on the page. Does not matter if there is free space nearer to the start of the page

  - Slot Array: (variable)
    - Responsible for the sort order of records on the page
    - grows backwards from the end of the page
    - 4 chars per record

# Server Lifecycle

## Startup
- Loads all DB pages containing records of the system table `objects` into memory. For a small DB, this should be only the first page of the file
  - If there is no data file, the server will initialize the DB by creating a data file with all of the system objects


# SQL Commands Workflow

## `Create Table`

1. Add a record to the `objects` table
  1. Read from the `sequences` table to get the next `object_id`. Unless we're creating the `sequences` table itself.
  1. Increment the next 
1. Add records to the `columns` table
1. Add a record to the `sequences` table if the new table has an identity column
1. Create a new DB page for the new table

# First Iteration

To begin, this DB will consist of a single, append-only table that lives entirely in memory. We will not be persisting any data to disk. This first table will have the following definition:

```
Create Table objects (
  object_id Int,
  object_type SmallInt,
  is_system_object Bit,
  name Varchar(128),
  root_page_id Int,
  parent_object_id Int,
  ddl_text Varchar(Max)
)
```

No indexes, no constraints.