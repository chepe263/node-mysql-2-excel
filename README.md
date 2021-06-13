# node-mysql-2-excel
Dump a mysql database to an excel file


# how to use

1. Install node dependencies

```
npm install
```

2. Make a copy of `.env.example` and rename it `.env`
3. Edit `.env` with your database values

```
DB_HOST="localhost"
DB_USER="root"
DB_PASS="password"
DB_DATABASE="database-name"

# The extension determines the file type for sheetjs
FILE_EXTENSION="xlsb"
```

4. Run index.js

```
npm index.js
```

The dump will be placed in current directory

```
./out/[database-name]-dump.xlxs
```