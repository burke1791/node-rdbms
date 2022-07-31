# node-rdbms
A stupid RDBMS written in node.

# What The Hell Is This Abomination??
The purpose of this project is to illustrate the storage internals of a database engine using data files stored as plaintext. In this project, 1 character is analogous to 1 byte in a typical RDBMS. Therefore, since a typical data page size is 8kb (8,192 bytes), this project uses data pages that are 8,192 characters long.